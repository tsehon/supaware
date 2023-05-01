const express = require('express');
const router = express.Router();
const { usersCollection, tokensCollection } = require('../db');
const jwt = require('jsonwebtoken');
const querystring = require('querystring');
const fetch = require('node-fetch');

// Oura Auth Request route
router.post('/authrequest', (req, res) => {
    console.log("POST /oura/authrequest");
    const { client_id, state, auth_url, redirect_uri } = req.body;

    const queryParams = querystring.stringify({
        response_type: 'code',
        redirect_uri: redirect_uri,
        client_id: client_id,
        state: state,
    });

    const redirectUrl = `${auth_url}?${queryParams}`;
    return res.status(200).json({ redirectUrl });
});

// Oura Authorize route
router.post('/authorize', async (req, res) => {
    console.log("POST /oura/authorize");
    const { code, scope, userToken, redirect_uri, client_id, client_secret, token_url } = req.body;
    const grant_type = 'authorization_code';

    const requestBody = querystring.stringify({
        grant_type,
        code,
        redirect_uri,
        client_id,
        client_secret,
    });

    const response = await fetch(token_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Encoding': 'utf-8',
        },
        body: requestBody
    });

    const rdata = await response.json();
    console.log("- Data: " + rdata);

    const username = jwt.verify(userToken, process.env.JWT_SECRET).username;
    const user = await usersCollection.findOne({ username });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // get the time of token expiry
    const currentTime = Math.floor(Date.now() / 1000);
    const expires_at = currentTime + rdata.expires_in;

    const data = {
        access_token: rdata.access_token,
        refresh_token: rdata.refresh_token,
        expires_at: expires_at,
    }


    // Store the data in MongoDB
    const newToken = {
        userId: user._id,
        accountType: "oura",
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiry: data.expiration,
        scope: scope,
    }

    await tokensCollection.insertOne(newToken);
    res.status(200).json({ data });
});

// Oura Refresh route
router.post('/refresh', async (req, res) => {
    console.log("POST /oura/refresh");
    const { grant_type, refresh_token, client_id, client_secret, token_url, userToken, scope } = req.body;

    const requestBody = querystring.stringify({
        grant_type,
        refresh_token,
        client_id,
        client_secret,
    });

    try {
        const response = await fetch(token_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Encoding': 'utf-8',
            },
            body: requestBody
        });

        const rdata = await response.json();
        console.log("- Data: " + rdata);

        const username = jwt.verify(userToken, process.env.JWT_SECRET).username;
        const user = await usersCollection.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // get the time of token expiry
        const currentTime = Math.floor(Date.now() / 1000);
        const expires_at = currentTime + rdata.expires_in;

        const data = {
            access_token: rdata.access_token,
            refresh_token: rdata.refresh_token,
            expires_at: expires_at,
        }

        // Store the data in MongoDB
        const newToken = {
            userId: user._id,
            accountType: "oura",
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiry: data.expiration,
            scope: scope,
        }

        const existingToken = await tokensCollection.findOne({ userId: user._id, accountType: "oura" });

        if (existingToken) {
            await tokensCollection.updateOne({ userId: user._id, accountType: "oura" }, { $set: newToken });
        } else {
            await tokensCollection.insertOne(newToken);
        }

        res.status(200).json({ data });
    } catch (error) {
        console.error('Error updating Oura refresh token:', error);
        res.status(500).json({ message: 'Error updating Oura refresh token' });
    }
});

module.exports = router;
