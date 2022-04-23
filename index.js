const axios = require('axios');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv/config');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const postsRouter = require('./routes/posts');
const paymentsRouter = require('./routes/payments');
const configRouter = require('./routes/config');
const authRouter = require('./routes/auth');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

app.use(bodyParser.json());
app.use(cookieParser());

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

const withAuth = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        res.status(401).send('Unauthorized: No token provided');
    } else {
        const decoded = await jwt.verify(token, secret);
        req.email = decoded.email;
        next();
    }
}

app.get('/check-auth', withAuth, function(req, res) {
    res.send('The password is potato');
});


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

app.use('/config', configRouter);
app.use('/posts', postsRouter);
app.use('/payment', paymentsRouter);
app.use('/auth', authRouter);

// ------------ DB ------------

const dbLink = process.env.DB_LINK;

mongoose.connect(dbLink, () => {
    console.log('Connected to DB!: ', dbLink);
});


app.listen(port, () => {
    console.log(`ICO gallery listening at http://localhost:${port}`)
})