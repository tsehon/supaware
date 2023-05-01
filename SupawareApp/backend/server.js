const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const app = express();
const { client } = require('./db');

// Middleware
app.use(cors());
app.use(express.json());

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

// Routes
const authRoutes = require('./routes/auth');
const ouraRoutes = require('./routes/oura');
const devicesRoutes = require('./routes/devices');
const openaiRoutes = require('./routes/openai');

app.use('/auth', authRoutes);
app.use('/oura', ouraRoutes);
app.use('/devices', devicesRoutes);
app.use('/openai', openaiRoutes);

// catch-all
app.all('*', (req, res) => {
    console.log("CATCH-ALL")
    console.log('Request URL:', req.url);
    res.status(404).send('Not Found');
});

// Error handling middleware
const errorHandling = require('./middlewares/errorHandling');
app.use(errorHandling);

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