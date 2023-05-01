const express = require('express');
const router = express.Router();
const { usersCollection, tokensCollection } = require('../db');
const jwt = require('jsonwebtoken');

// Get connected devices route 
router.get('/connected', async (req, res) => {
    console.log("GET /devices/connected");

    const username = jwt.verify(req.headers.authorization, process.env.JWT_SECRET).username;
    console.log("- Username: " + username);
    const user = await usersCollection.findOne({ username });

    if (!user) {
        console.log("- User not found");
        return res.status(404).json({ message: 'User not found' });
    }

    const tokens = tokensCollection.find({ userId: user._id });

    if (!tokens) {
        console.log("- No devices found");
        return res.json([]);
    }

    const devices = [];
    await tokens.forEach((token) => {
        devices.push(token);
    });

    console.log("- Devices found:", devices);
    res.json(devices);
});

// Disconnect route
router.post('/disconnect', async (req, res) => {
    console.log("POST /devices/disconnect");
    const { userToken, deviceType } = req.body;
    console.log("- deviceType: " + deviceType);
    console.log("- userToken: " + userToken);

    const username = jwt.verify(userToken, process.env.JWT_SECRET).username;
    const user = await usersCollection.findOne({ username });

    if (!user) {
        console.log("- User not found");
        return res.status(404).json({ message: 'User not found' });
    }

    const token = await tokensCollection.findOne({ userId: user._id, accountType: deviceType });
    if (!token) {
        console.log("- Token not found");
        return res.status(404).json({ message: 'Token not found' });
    }

    await tokensCollection.deleteOne({ userId: user._id, accountType: deviceType });
    res.status(200).json({ message: 'Token deleted successfully' });
});

module.exports = router;
