const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ihoeb4c.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db('storyteller').collection('services');

        app.get('/services', async (req, res) => {
            const query = {};
            const options = { sort: { price: 1 } }
            const cursor = serviceCollection.find(query, options);
            const services = await cursor.limit(3).toArray();
            res.send(services)
        })

        app.get('/allServices', async (req, res) => {
            const query = {};
            const options = { sort: { price: 1 } }
            const cursor = serviceCollection.find(query, options);
            const services = await cursor.toArray();
            res.send(services)
        })
    }
    finally {

    }

}
run().catch(err => console.error(err))


app.get('/', (req, res) => {
    res.send('storyteller server is running')
})



app.listen(port, () => {
    console.log('server is running on port', port)
})