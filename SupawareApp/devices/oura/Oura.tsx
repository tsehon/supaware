import Device from "../../interfaces/DeviceInterface";

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// @ts-ignore
import { OURA_CLIENT_ID, OURA_CLIENT_SECRET } from '@env';
const OURA_AUTH_URL = 'https://cloud.ouraring.com/oauth/authorize';
const OURA_TOKEN_URL = 'https://api.ouraring.com/oauth/token';
const OURA_REDIRECT_URI = 'supaware://oura-callback';

// @ts-ignore
import { API_URL } from '@env';
axios.defaults.baseURL = API_URL;

import { Linking } from 'react-native';

export class Oura implements Device {
    name: string = "Oura";
    image = null;
    owner = "";
    is_connected = false;
    access_token = "";
    refresh_token = "";
    expires_at = 0;
    scope = "";

    async authRequest(userToken: string) {
        console.log('Oura authRequest userToken:', userToken);

        try {
            const response = await axios.post('oura/authrequest', {
                client_id: OURA_CLIENT_ID,
                state: userToken,
                auth_url: OURA_AUTH_URL,
                redirect_uri: OURA_REDIRECT_URI,
            });
            console.log('Oura authRequest status:', response.status);

            // Perform the redirect on the client-side
            const redirectUrl = response.data.redirectUrl;
            Linking.openURL(redirectUrl);
        } catch (error) {
            console.error('Oura authRequest error:', error);
        }
    }

    async authCallback(event: any) {
        console.log('Oura authCallback event:', event);
        // If the user denied access, log the error and return
        if (event.error === 'access_denied') {
            console.error('Error authorizing Oura:', event.error_description);
            return;
        }

        // Parse the URL and extract the query parameters
        const url = event.url;
        const getQueryParam = (name: string) => {
            const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
            const results = regex.exec(url);
            if (!results || !results[2]) return null;
            return decodeURIComponent(results[2].replace(/\+/g, ' '));
        };

        // Get the code, user token, and scope from the query parameters
        const code = getQueryParam('code');
        const userToken = getQueryParam('state');
        const scope = getQueryParam('scope');

        const redirect_uri = OURA_REDIRECT_URI;
        const client_id = OURA_CLIENT_ID;
        const client_secret = OURA_CLIENT_SECRET;
        const token_url = OURA_TOKEN_URL;

        try {
            // Exchange the code for an access token
            const response = await axios.post('/oura/authorize', {
                code,
                userToken,
                scope,
                redirect_uri,
                client_id,
                client_secret,
                token_url,
            });

            if (userToken !== null) {
                this.owner = userToken;
            }

            console.log('Oura authCallback:', response.data);

            // Store the access token, refresh token, and expiry date
            this.access_token = response.data.access_token;
            this.refresh_token = response.data.refresh_token;
            this.expires_at = response.data.expires_at;

        } catch (error) {
            console.error('Oura authCallback:', error);
        }
    }

    async refresh() {
        // check if past expiry date
        if (this.expires_at === 0) {
            console.log('Oura refresh: no token');
            return;
        }
        const currentTime = Math.floor(Date.now() / 1000);
        if (this.expires_at <= currentTime) {
            console.log('Oura refresh: token expired');
            // refresh token
            try {
                const response = await axios.post('/oura/refresh', {
                    grant_type: 'refresh_token',
                    refresh_token: this.refresh_token,
                    client_id: OURA_CLIENT_ID,
                    client_secret: OURA_CLIENT_SECRET,
                    token_url: OURA_TOKEN_URL,
                    userToken: this.owner,
                    scope: this.scope,
                });

                // update tokens
                this.access_token = response.data.access_token;
                this.refresh_token = response.data.refresh_token;
                this.expires_at = response.data.expires_at;

                console.log('Oura refresh success:', response.data);
            } catch (error) {
                console.error('Oura refresh error:', error);
            }
        }
        else {
            console.log('Oura refresh: token not expired');
        }
    }

    async disconnect() {
        if (this.owner === "") {
            console.error(this.name + ' disconnect: owner is empty');
            return;
        }

        const type = this.name.toLowerCase();

        // clear all data
        this.owner = "";
        this.is_connected = false;
        this.access_token = "";
        this.refresh_token = "";
        this.expires_at = 0;
        this.scope = "";

        axios.post('/disconnect', {
            userToken: this.owner,
            deviceType: type,
        }).then((response) => {
            console.log('Oura disconnect:', response.data);
        }).catch((error) => {
            console.error('Oura disconnect:', error);
        });
    }
}