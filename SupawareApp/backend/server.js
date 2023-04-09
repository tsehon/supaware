const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

client.connect((err) => {
    if (err) {
        console.error('Failed to connect to MongoDB:', err);
        return;
    }

    // Access the "users" collection in your database
    const usersCollection = client.db('your_database_name').collection('users');

    // Register route
    app.post('/register', async (req, res, next) => {
        const { username, password } = req.body;

        const existingUser = users.find((u) => u.username === username);
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
        const { username, password } = req.body;

        const user = await usersCollection.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ userId: user.username }, process.env.JWT_SECRET);
        res.json({ token });
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
        client.close();
        process.exit();
    });
});
