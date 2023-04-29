import Device from "../../interfaces/DeviceInterface";

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// @ts-ignore
import { OURA_CLIENT_ID, OURA_CLIENT_SECRET } from '@env';
const OURA_AUTH_URL = 'https://api.ouraring.com/oauth/authorize';
const OURA_REDIRECT_URI = 'supaware://oura-callback';

export class Oura implements Device {
    name: string = "Oura";
    image = null;

    async authRequest(userToken: string) {
        const response = await axios.post('oura/authrequest', {
            client_id: OURA_CLIENT_ID,
            state: {
                token: userToken,
            }
        })
            .then(response => {
                console.log('Oura authRequest:', response.data);
            })
            .catch(error => {
                console.error('Oura authRequest:', error);
            });
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
        const redirect_uri = 'supaware://oura-callback';
        const client_id = OURA_CLIENT_ID;
        const client_secret = OURA_CLIENT_SECRET;

        // Exchange the code for an access token
        const response = await axios.post('/oura/authorize', {
            code,
            userToken,
            scope,
            redirect_uri,
            client_id,
            client_secret,
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