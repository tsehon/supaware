const express = require('express');
const router = express.Router();
const { usersCollection } = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register route
router.post('/register', async (req, res, next) => {
    console.log("POST /register");
    const { username, password } = req.body;

    const existingUser = await usersCollection.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { username, password: hashedPassword };
        await usersCollection.insertOne(newUser);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        next(err);
    }
});

// Login route
router.post('/login', async (req, res) => {
    console.log("POST /login");
    const { username, password } = req.body;

    const user = await usersCollection.findOne({ username });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET);

    res.json({ token });
});

module.exports = router;