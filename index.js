const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if(!authorization){
        return res.status(401).send( {error : true, message : 'unauthorized access'});
    }

    const token = authorization.split(' ')[1];
    jwt.verify(tokem, process.env.ACCESS_TOKEN_SECRET, (err, decoded) =>{
        if(err){
            return res.status(401).send( {error : true, message : 'unauthorized access'});
        }
        req.decoded = decoded;
        next();
    })
}

// TODO : use it in get func when using verifyJWT 
// const decodedEmail = req.decoded.email;
// if(email !== decidedEmail){
//     return res.status(403).send( {error : true, message : 'forbidden access'});
// }

app.get('/', (req, res) => {
    res.send('AA is running');
})

app.post('/jwt', (req, res) =>{
    const user = req.body;
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    res.send({ token });
})

app.listen(port, () => {
    console.log(`AA is running on port ${port}`);
})