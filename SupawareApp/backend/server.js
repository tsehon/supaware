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

// Oura API route
app.post('/oura/authorize', async (req, res) => {
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
    const expirationTime = currentTime + rdata.expires_in;
    const expiration = new Date(expirationTime);

    const data = {
        access_token: rdata.access_token,
        refresh_token: rdata.refresh_token,
        expiration: expiration,
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

app.get('/devices', async (req, res) => {
    console.log("GET /devices");

    const username = jwt.verify(req.headers.authorization, process.env.JWT_SECRET).username;
    console.log("- Username: " + username);
    const user = await usersCollection.findOne({ username });

    if (!user) {
        console.log("- User not found");
        return res.status(404).json({ message: 'User not found' });
    }

    const device_tokens = tokensCollection.find({ userId: user._id });
    let device_types = []
    for await (const token of device_tokens) {
        device_types.push(token.accountType);
    }

    console.log("- Device types: " + device_types);

    if (!device_types || device_types.length == 0) {
        res.json([]);
    }
    else {
        const devices = device_types;
        res.json(devices);
    }
});

app.post('/disconnect', async (req, res) => {
    console.log("POST /disconnect");
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

// catch-all
app.all('*', (req, res) => {
    console.log("CATCH-ALL")
    console.log('Request URL:', req.url);
    res.status(404).send('Not Found');
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