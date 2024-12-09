require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kxfhf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const visaCollection = client.db('visaDB').collection('visas');
        const applicationCollection = client.db('visaDB').collection('application');


        // Get All visas
        app.get('/all_visas', async (req, res) => {
            const cursor = visaCollection.find()
            const result = await cursor.toArray();
            res.send(result);
        });


        //Get my visa application
        app.get('/my_visa_application', async (req, res) => {
            const { email } = req.query;
            const cursor = applicationCollection.find({ applicant_email: email })
            const result = await cursor.toArray();
            res.send(result);
        });

        // Get the latest 6 all_visas
        app.get('/all_visas', async (req, res) => {
            const cursor = visaCollection.find().sort({ _id: -1 }).limit(6); // Sort by _id descending to get the latest
            const result = await cursor.toArray();
            res.send(result);
        });

        // Get details of a specific visa by ID
        app.get('/all_visas/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await visaCollection.findOne(query);
            res.send(result);
        });
        // Get my added visa by Email
        app.get('/all_visas/:email', async (req, res) => {
            const cursor = visaCollection.find()
            const result = await cursor.toArray();
            res.send(result);
        });

        // Create a new visa
        app.post('/all_visas', async (req, res) => {
            const newVisa = req.body;
            const result = await visaCollection.insertOne(newVisa);
            res.send(result);
        });

        // Update a visa
        app.put('/all_visas/:id', async (req, res) => {
            const id = req.params.id;
            const updatedVisa = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const visa = {
                $set: {
                    ...updatedVisa,
                }
            };
            const result = await visaCollection.updateOne(filter, visa, options);
            res.send(result);
        });

        // Delete a visa
        app.delete('/all_visas/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await visaCollection.deleteOne(query);
            res.send(result);
        });


        // Delete from my visa application
        app.delete('/my_visa_applications/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await applicationCollection.deleteOne(query);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('Tenth assignment server is running')
})

app.listen(port, () => {
    console.log(`Tenth assignment Server is running on port: ${port}`)
})