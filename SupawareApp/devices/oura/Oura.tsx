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

    async authRequest(userToken: string) {
        try {
            const response = await axios.post('oura/authrequest', {
                client_id: OURA_CLIENT_ID,
                state: {
                    token: userToken,
                },
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
        // If the user denied access, log the error and return
        if (event.error === 'access_denied') {
            console.error('Error authorizing Oura:', event.error_description);
            return;
        }

        // Get the code, user token, and scope from the event
        const code = event.code;
        const userToken = event.state.token;
        const scope = event.scope;
        const redirect_uri = OURA_REDIRECT_URI;
        const client_id = OURA_CLIENT_ID;
        const client_secret = OURA_CLIENT_SECRET;
        const token_url = OURA_TOKEN_URL;

        // Exchange the code for an access token
        const response = await axios.post('/oura/authorize', {
            code,
            userToken,
            scope,
            redirect_uri,
            client_id,
            client_secret,
            token_url,
        })
            .then(response => {
                console.log('Oura authCallback:', response.data);
            })
            .catch(error => {
                console.error('Oura authCallback:', error);
            });

        // Save the access token, refresh token, and expiration time in AsyncStorage
        const { access_token, refresh_token, expiration } = response.data;
        AsyncStorage.setItem('oura-accessToken', access_token);
        AsyncStorage.setItem('oura-refreshToken', refresh_token);
        AsyncStorage.setItem('oura-expiry', expiration);
    }

    refresh() {
        throw new Error("Method not implemented.");
    }
}