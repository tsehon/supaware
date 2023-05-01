const { MongoClient, ServerApiVersion } = require('mongodb');
const dotenv = require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

const usersCollection = client.db('supaware-db').collection('users');
const tokensCollection = client.db('supaware-db').collection('tokens');

module.exports = {
    client,
    usersCollection,
    tokensCollection,
};
