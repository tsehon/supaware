import Device, { getToday, getYesterday } from "../../interfaces/DeviceInterface";

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
    data = {
        sleep: [] as any[],
        activity: [] as any[],
        readiness: [] as any[],
    };

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
    }

    async disconnect() {
        if (this.owner === "") {
            console.error(this.name + ' disconnect: owner is empty');
            return;
        }

        const type = this.name.toLowerCase();

        axios.post('/devices/disconnect', {
            userToken: this.owner,
            deviceType: type,
        }).then((response) => {
            console.log('Oura disconnect:', response.data);
        }).catch((error) => {
            console.error('Oura disconnect:', error);
        });

        // clear all data
        this.owner = "";
        this.is_connected = false;
        this.access_token = "";
        this.refresh_token = "";
        this.expires_at = 0;
        this.scope = "";
    }

    async fetchData(): Promise<void> {
        if (this.access_token === "") {
            console.error('Oura fetch_sleep_data: access token is empty');
            return;
        }

        if (this.owner === "") {
            console.error(this.name + ' fetchdata: owner is empty');
            return;
        }

        // refresh token
        await this.refresh();

        try {
            await this.fetch_activity_data();
            await this.fetch_readiness_data();
            await this.fetch_sleep_data();
            console.log('Oura data fetched.');
        }
        catch (error) {
            console.error('Oura fetchdata:', error);
        }
    }

    async fetch_sleep_data(): Promise<void> {
        const start = getYesterday();
        const end = getToday();

        try {
            const response = await axios.get('https://api.ouraring.com/v1/sleep', {
                headers: {
                    'Authorization': `Bearer ${this.access_token}`,
                },
                params: {
                    'start': start,
                    'end': end,
                },
            });

            if (response.status === 200 && response.data) {
                this.data.sleep = response.data.sleep;
            } else {
                console.error('Oura fetch_sleep_data: Error:', response);
            }
        } catch (error) {
            console.error('Oura fetch_sleep_data: Error:', error);
        }
    }

    async fetch_activity_data(): Promise<void> {
        const start = getYesterday();
        const end = getToday();

        try {
            const response = await axios.get('https://api.ouraring.com/v1/activity', {
                headers: {
                    'Authorization': `Bearer ${this.access_token}`,
                },
                params: {
                    'start': start,
                    'end': end,
                },
            });

            if (response.status === 200 && response.data) {
                this.data.activity = response.data.activity;
            } else {
                console.error('Oura fetch_activity_data: Error:', response);
            }
        } catch (error) {
            console.error('Oura fetch_activity_data: Error:', error);
        }
    }

    async fetch_readiness_data(): Promise<void> {
        const start = getYesterday();
        const end = getToday();

        try {
            const response = await axios.get('https://api.ouraring.com/v1/readiness', {
                headers: {
                    'Authorization': `Bearer ${this.access_token}`,
                },
                params: {
                    'start': start,
                    'end': end,
                },
            });

            if (response.status === 200 && response.data) {
                this.data.readiness = response.data.readiness;
            } else {
                console.error('Oura fetch_readiness_data: Error:', response);
            }
        } catch (error) {
            console.error('Oura fetch_readiness_data: Error:', error);
        }
    }

    getDataSummary(): string {
        const { activity, readiness, sleep } = this.data;

        if (!activity || !readiness || !sleep) {
            console.error('Oura getDataSummary: data is empty');
            return '';
        }

        let summary = '';

        summary += 'Activity:\n';
        activity.forEach((item) => {
            summary +=
                `- Summary Date: ${item.summary_date}\n` +
                `- Score: ${item.score}\n` +
                `- Steps: ${item.steps}\n` +
                `- Calories Total: ${item.cal_total}` +
                `- Calories Active: ${item.cal_active}\n` +
                `- Met Min Inactive: ${item.met_min_inactive}\n` +
                `- Met Min Low: ${item.met_min_low}\n` +
                `- Met Min Medium: ${item.met_min_medium}\n` +
                `- Met Min High: ${item.met_min_high}\n` +
                `- Average Met: ${item.average_met}\n` +
                `\n`;
        });

        summary += 'Readiness:\n';
        readiness.forEach((item) => {
            summary +=
                `- Summary Date: ${item.summary_date}\n` +
                `- Score: ${item.score}\n` +
                `- Score Previous Night: ${item.score_previous_night}\n` +
                `- Score Sleep Balance: ${item.score_sleep_balance}\n` +
                `- Score Previous Day: ${item.score_previous_day}\n` +
                `- Score Activity Balance: ${item.score_activity_balance}\n` +
                `- Score Resting Heart Rate: ${item.score_resting_hr}\n` +
                `- Score Heart Rate Variability: ${item.score_hrv_balance}\n` +
                `- Score Recovery Index: ${item.score_recovery_index}\n` +
                `- Score Temperature: ${item.score_temperature}\n` +
                `\n`;
        });

        summary += 'Sleep:\n';
        sleep.forEach((item) => {
            summary +=
                `- Summary Date: ${item.summary_date}\n` +
                `- Is Longest: ${item.is_longest}\n` +
                `- Timezone: ${item.timezone}\n` +
                `- Bedtime Start: ${item.bedtime_start}\n` +
                `- Bedtime End: ${item.bedtime_end}\n` +
                `- Score: ${item.score}\n` +
                `- Score Total: ${item.score_total}\n` +
                `- Score Disturbances: ${item.score_disturbances}\n` +
                `- Score Efficiency: ${item.score_efficiency}\n` +
                `- Score Latency: ${item.score_latency}\n` +
                `- Score REM: ${item.score_rem}\n` +
                `- Score Deep: ${item.score_deep}\n` +
                `- Score Alignment: ${item.score_alignment}\n` +
                `- Total: ${item.total}\n` +
                `- Duration: ${item.duration}\n` +
                `- Awake: ${item.awake}\n` +
                `- Light: ${item.light}\n` +
                `- REM: ${item.rem}\n` +
                `- Deep: ${item.deep}\n` +
                `- Onset Latency: ${item.onset_latency}\n` +
                `- Restless: ${item.restless}\n` +
                `- Efficiency: ${item.efficiency}\n` +
                `- Midpoint Time: ${item.midpoint_time}\n` +
                `- HR Lowest: ${item.hr_lowest}\n` +
                `- HR Average: ${item.hr_average}\n` +
                `- RMSSD: ${item.rmssd}\n` +
                `- Breath Average: ${item.breath_average}\n` +
                `- Temperature Delta: ${item.temperature_delta}\n` +
                `\n`;
        });

        console.log('Oura getDataSummary:\n', summary);
        return summary;
    }
}