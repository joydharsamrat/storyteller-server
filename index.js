const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ihoeb4c.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const verifyJwt = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access')
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send('unauthorized access')
        }
        req.decoded = decoded;
        next()
    })
}

async function run() {
    try {
        const serviceCollection = client.db('storyteller').collection('services');
        const reviewCollection = client.db('storyteller').collection('reviews');

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ token })
        })


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

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const service = await serviceCollection.findOne(query);
            res.send(service)
        })

        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service)
            res.send(result)
        })

        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { serviceId: id }
            const options = { sort: { created_at: -1 } }
            const cursor = reviewCollection.find(query, options)
            const reviews = await cursor.toArray();
            res.send(reviews)
        })


        app.get('/reviews', verifyJwt, async (req, res) => {
            const decoded = req.decoded;
            if (decoded.user !== req.query.email) {
                return res.status(403).send('Forbidden Access')
            }
            const { email } = req.query;
            const query = { userEmail: email }
            const options = { sort: { created_at: -1 } }
            const cursor = reviewCollection.find(query, options)
            const reviews = await cursor.toArray()
            res.send(reviews)
        })

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            req.body.created_at = new Date();
            const result = await reviewCollection.insertOne(review)
            res.send(result)
        })

        app.patch('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const { text } = req.body;
            console.log(req.body)
            const update_doc = {
                $set: {
                    reviewText: text
                }
            }
            const query = { _id: ObjectId(id) }
            const result = await reviewCollection.updateOne(query, update_doc)
            res.send(result)
        })

        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await reviewCollection.deleteOne(query);
            res.send(result)
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