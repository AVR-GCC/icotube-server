const axios = require('axios');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv/config');
const bodyParser = require('body-parser');
const postsRouter = require('./routes/posts');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

app.use(bodyParser.json());

// ------------ MIDDLEWARE ------------

// logger

app.use((req, res, next) => {
    console.log(`Route: ${req.method} - ${req.url}`);
    if (Object.keys(req.body).length) {
        console.log('body:');
        console.log(req.body);
    }
    next();
})


// ------------ ROUTES ------------

app.get('/', async (req, res) => {
    try {
        res.send('This is the right place, yes');
        console.log('hello log, its me Bar');
    } catch (err) {
        console.log('get errorr!!', err);
        res.send('failed!!');
    }
});

app.use('/posts', postsRouter);

// ------------ DB ------------

const dbLink = process.env.DB_LINK;

mongoose.connect(dbLink, () => {
    console.log('Connected to DB!: ', dbLink);
});


app.listen(port, () => {
    console.log(`ICO gallery listening at http://localhost:${port}`)
})