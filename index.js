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
        // await client.connect();

        const visaCollection = client.db('visaDB').collection('visas');
        const applicationCollection = client.db('visaDB').collection('application');


        // Get All visas
        app.get('/all_visas', async (req, res) => {
            const visaType = req.query.type; // Optional query parameter
            const query = visaType ? { visa_type: visaType } : {};
            const cursor = visaCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });
        // Get visas by types
        app.get('/visaTypes', async (req, res) => {
            const distinctTypes = await visaCollection.distinct('visa_type');
            res.send(distinctTypes);
        });

        //Get my added Visas
        app.get('/all_visas/:email', async (req, res) => {
            const email = req.params.email;
            const cursor = visaCollection.find({ email })
            const result = await cursor.toArray();
            res.send(result);
        });

        //Get my visa application
        app.get('/visaApplication/:email', async (req, res) => {
            const email = req.params.email;
            const searchParams = req.query.searchParams || "";

            const query = {
                email: email,
                country_name: { $regex: searchParams, $options: "i" },
            };
            const cursor = applicationCollection.find(query)
            const result = await cursor.toArray();
            res.send(result);
        });

        // Get the latest Six visas
        app.get('/latestVisas', async (req, res) => {
            const cursor = visaCollection.find().sort({ _id: -1 }).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        });

        // Get details of a specific visa by ID
        app.get('/visa_details/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await visaCollection.findOne(query);
            res.send(result);
        });


        // Create a new visa
        app.post('/all_visas', async (req, res) => {
            const newVisa = req.body;
            const result = await visaCollection.insertOne(newVisa);
            res.send(result);
        });

        //Create visa application
        app.post('/visaApplication', async (req, res) => {
            const newApplication = req.body;
            const result = await applicationCollection.insertOne(newApplication);
            res.send(result);
        });

        // Update a visa
        app.put('/all_visas/:id', async (req, res) => {
            const id = req.params.id;
            const updatedVisa = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    country_name: updatedVisa.country_name,
                    visa_type: updatedVisa.visa_type,
                    processing_time: updatedVisa.processing_time,
                    fee: updatedVisa.fee,
                    validity: updatedVisa.validity,
                    application_method: updatedVisa.application_method,
                    required_documents: updatedVisa.required_documents,
                    description: updatedVisa.description,
                    age_restriction: updatedVisa.age_restriction,
                    country_image: updatedVisa.country_image
                }
            };
            const result = await visaCollection.updateOne(filter, updatedDoc, options);
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
        app.delete('/visaApplication/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: id };
            const result = await applicationCollection.deleteOne(query);
            res.send(result);
        });

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
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
    // console.log(`Tenth assignment Server is running on port: ${port}`)
})



