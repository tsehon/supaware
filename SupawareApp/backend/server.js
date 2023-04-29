const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv').config();
const querystring = require('querystring');
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1
});

// Database collections
const usersCollection = client.db('supaware-db').collection('users');
const tokensCollection = client.db('supaware-db').collection('tokens');

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        console.log('Connecting to MongoDB...');
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (err) {
        console.log("Error connecting to MongoDB: " + err)
        console.log(err.stack);
    }
}

// Register route
app.post('/register', async (req, res, next) => {
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
app.post('/login', async (req, res) => {
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

app.post('/oura/authrequest', (req, res) => {
    console.log("POST /oura/authrequest");
    const { client_id, state } = req.body;

    const queryParams = querystring.stringify({
        response_type: 'code',
        redirect_uri: 'supaware://oura-callback',
        client_id: client_id,
        state: state,
    });

    res.redirect(`https://api.ouraring.com/oauth/authorize?${queryParams}`);
});

// Oura API route
app.post('/oura/authorize', async (req, res) => {
    console.log("POST /oura/authorize");
    const { code, scope, userToken, redirect_uri, client_id, client_secret } = req.body;
    const grant_type = 'authorization_code';

    const response = await fetch('https://api.ouraring.com/oauth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Encoding': 'utf-8',
        },
        body: `grant_type=${grant_type}&code=${code}&redirect_uri=${redirect_uri}&client_id=${client_id}&client_secret=${client_secret}`
    });

    const data = await response.json();

    const username = jwt.verify(userToken, process.env.JWT_SECRET).username;
    const user = await usersCollection.findOne({ username });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // get the time of token expiry
    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = currentTime + data.expires_in;
    const expiration = new Date(expirationTime);

    // Store the data in MongoDB
    const newToken = {
        userId: user._id,
        accountType: "oura",
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiry: expiration,
        scope: scope,
    }

    await tokensCollection.insertOne(newToken);
    res.json(data, expiration);
});

app.get('/devices', async (req, res) => {
    console.log("GET /devices");

    const username = jwt.verify(req.headers.authorization, process.env.JWT_SECRET).username;
    const user = await usersCollection.findOne({ username });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const device_tokens = tokensCollection.find({ userId: user._id });
    const device_types = await device_tokens.accountType;

    if (!device_types) {
        console.log("- No devices found");
        return [];
    }

    const devices = device_types.toArray();
    res.json(devices);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'An error occurred' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Close the connection when the server is stopped
process.on('SIGINT', () => {
    console.log('\nClosing MongoDB connection...');
    client.close();
    process.exit();
});

run().catch(console.dir);