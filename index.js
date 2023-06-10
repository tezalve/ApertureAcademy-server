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

        app.post('/adduser', async(req, res)=>{
            const doc = req.body;
            const query = { email: doc.email }
            const user = await users.findOne(query);
            if(user == null){
                const result = await users.insertOne(doc);
                res.send(result);
                console.log("New user");
            }else{
                console.log("Old user");
            }
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