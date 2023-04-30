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

            console.log('Oura authCallback:', response.data);

            // Save the access token, refresh token, and expiration time in AsyncStorage
            const { access_token, refresh_token, expiration } = response.data;
            await AsyncStorage.setItem('oura-accessToken', access_token);
            await AsyncStorage.setItem('oura-refreshToken', refresh_token);
            await AsyncStorage.setItem('oura-expiry', expiration);
        } catch (error) {
            console.error('Oura authCallback:', error);
        }
    }


    refresh() {
        throw new Error("Method not implemented.");
    }
}