import React, { useContext, useEffect } from 'react';
import { Linking } from 'react-native';
import axios from 'axios';
// @ts-ignore
import { OURA_CLIENT_ID, OURA_CLIENT_SECRET } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';

const authorizeOura = async (userToken: string) => {
    const response = axios.post('https://api.ouraring.com/oauth/authorize', {
        response_type: 'code',
        client_id: OURA_CLIENT_ID,
        redirect_uri: 'supaware://oura-callback',
        state: userToken,
    });
};

export const handleOuraAuthentication = async (event: any) => {
    if (event.error === 'access_denied') {
        console.error('Error authorizing Oura:', event.error_description);
        return;
    }

    const res = await axios.post('/oura/authorize', {
        code: event.code,
        scope: event.scope,
        userToken: event.state,
    });


}


const handleOpenURL = async () => {
    // Extract the authorization code from the URL
    const url = new URL(event.url);
    const authorizationCode = url.searchParams.get('code');

    if (authorizationCode) {
        try {
            // Exchange the authorization code for an access token
            const response = await axios.post('https://api.ouraring.com/oauth/token', {
                grant_type: 'authorization_code',
                client_id: OURA_CLIENT_ID,
                client_secret: OURA_CLIENT_SECRET,
                code: authorizationCode,
                redirect_uri: 'supaware://oura-callback',
            });

            // Save the access token, refresh token, and expiration time in MongoDB and AsyncStorage
            const { access_token, refresh_token, expires_in } = response.data;
            AsyncStorage.setItem('oura-accessToken', access_token);
            AsyncStorage.setItem('oura-refreshToken', refresh_token);
            AsyncStorage.setItem('oura-expiry', expires_in);

            // Use the access token to fetch data from the Oura API
            // ...

        } catch (error) {
            console.error('Error exchanging authorization code for access token:', error);
        }
    }
};