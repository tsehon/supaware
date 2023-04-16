import { useEffect } from 'react';
import { Linking } from 'react-native';
import axios from 'axios';
import { OURA_CLIENT_ID, OURA_CLIENT_SECRET } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';

const handleOpenURL = async (event) => {
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

            // Save the access token, refresh token, and expiration time
            const { access_token, refresh_token, expires_in } = response.data;
            // ... save tokens and expiration time, e.g., in AsyncStorage or another storage
            const userToken = AsyncStorage.getItem('usertoken');
            const username = jwtDecode(userToken).username;
            axios.post('/store_tokens', {
                username,
                access_token,
                refresh_token,
                expires_in,
            });

            // Use the access token to fetch data from the Oura API
            // ...

        } catch (error) {
            console.error('Error exchanging authorization code for access token:', error);
        }
    }
};

useEffect(() => {
    // Add the listener when the component mounts
    Linking.addEventListener('url', handleOpenURL);

    // Remove the listener when the component unmounts
    return () => {
        Linking.removeEventListener('url', handleOpenURL);
    };
}, []);
