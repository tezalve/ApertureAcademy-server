const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'unauthorized access' });
    }

    const token = authorization.split(' ')[1];
    jwt.verify(tokem, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: true, message: 'unauthorized access' });
        }
        req.decoded = decoded;
        next();
    })
}

app.post('/jwt', (req, res) => {
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    res.send({ token });
})

// TODO : use it in get func when using verifyJWT 
// const decodedEmail = req.decoded.email;
// if(email !== decidedEmail){
//     return res.status(403).send( {error : true, message : 'forbidden access'});
// }

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.vvdmedc.mongodb.net/?retryWrites=true&w=majority`;

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

        const classes = client.db('ApertureAcademy').collection('classes');
        const instructors = client.db('ApertureAcademy').collection('instructors');
        const users = client.db('ApertureAcademy').collection('users');
        const addedclasses = client.db('ApertureAcademy').collection('addedclasses');


        app.get('/class/:id', async (req, res) => {
            const id = new ObjectId(req.params.id);
            const result = await classes.findOne({ _id: id });
            res.send(result);
        })

        app.get('/classes', async (req, res) => {
            const cursor = classes.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/instructors', async (req, res) => {
            const cursor = instructors.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/users', async (req, res) => {
            const cursor = users.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/individual/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await users.findOne(query);
            res.send(user);
        })

        app.get('/insclasses/:email', async (req, res) => {
            const email = req.params.email;
            const query = { instructor_email: email };
            const cursor = classes.find(query);
            if ((await classes.countDocuments(query)) === 0) {
                console.log("No documents found!");
            }
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/selectedclasses/:email', async (req, res) => {
            const email = req.params.email;
            const query = { user_email: email, payment_done: false };
            const cursor = addedclasses.find(query);
            if ((await addedclasses.countDocuments(query)) === 0) {
                console.log("No documents found!");
            }
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/selectedclassesid/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await addedclasses.findOne(query);
            res.send(result);
        })

        app.get('/enrclasses/:email', async (req, res) => {
            const email = req.params.email;
            const query = { user_email: email, payment_done: true };
            const cursor = addedclasses.find(query);
            if ((await addedclasses.countDocuments(query)) === 0) {
                console.log("No documents found!");
            }
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/adduser', async (req, res) => {
            const doc = req.body;
            const query = { email: doc.email }
            const user = await users.findOne(query);
            if (user == null) {
                const result = await users.insertOne(doc);
                res.send(result);
                console.log("New user");
            } else {
                console.log("Old user");
            }
        })

        app.post('/addclass', async (req, res) => {
            const doc = req.body;
            const result = await classes.insertOne(doc);
            res.send(result);
        })

        app.post('/addedclasses', async (req, res) => {
            const doc = req.body;
            const result = await addedclasses.insertOne(doc);
            res.send(result);
        })

        app.put('/updateclass', async (req, res) => {
            const doc = req.body;
            const filter = { _id: new ObjectId(doc._id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    image: doc.image,
                    class_name: doc.class_name,
                    instructor_name: doc.instructor_name,
                    instructor_email: doc.instructor_email,
                    available_seats: doc.available_seats,
                    price: doc.price
                },
            };
            console.log('updated class: ', updateDoc);
            const result = await classes.updateOne(filter, updateDoc, options);
            res.send(result);
            console.log(
                `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
            );
        })

        app.patch('/updateuser/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { _id: new ObjectId(doc._id) };
            const options = { upsert: false };
            const updateDoc = {
                $set: {
                    role: req.body.role
                },
            };
            const result = await users.updateOne(filter, updateDoc, options);
        })

        app.patch('/updateclassstatus/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: false };
            const updateDoc = {
                $set: {
                    status: req.body.status
                },
            };
            const result = await classes.updateOne(filter, updateDoc, options);
        })

        app.patch('/updatefeedback', async (req, res) => {
            const doc = req.body;
            const filter = { _id: new ObjectId(doc._id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    feedback: doc.feedback
                },
            };
            const result = await classes.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        app.patch('/paymentdone/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: false };
            const updateDoc = {
                $set: {
                    payment_done: true
                },
            };
            const result = await addedclasses.updateOne(filter, updateDoc, options);
        })

        app.patch('/updateseat/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: false };
            const updateDoc = {
                $inc: { available_seats: -1, enrolled: +1 },
            };
            const result = await classes.updateOne(filter, updateDoc, options);
        })

        app.delete('/deleteaddedclass/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const filter = { _id: new ObjectId(id) }
            const result = await addedclasses.deleteOne(filter);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.log);


app.get('/', (req, res) => {
    res.send('AA is running');
})

app.listen(port, () => {
    console.log(`AA is running on port ${port}`);
})