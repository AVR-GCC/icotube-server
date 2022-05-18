const axios = require('axios');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv/config');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
require('./passport.js');
const cookieSession = require('cookie-session');
const postsRouter = require('./routes/posts');
const paymentsRouter = require('./routes/payments');
const configRouter = require('./routes/config');
const authRouter = require('./routes/auth');
const { withAuth, oneDay } = require('./routes/utils');
const app = express();
const port = process.env.PORT || 5000;

const corsConfig = {
    origin: true,
    credentials: true,
};

app.use(cors(corsConfig));
app.options('*', cors(corsConfig));

app.use(bodyParser.json());
app.use(cookieParser());

// ------------ MIDDLEWARE ------------

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});

app.use(cookieSession({
    name: 'session',
    keys: ['lama'],
    maxAge: oneDay
}));

app.use(passport.initialize())
app.use(passport.session())

// logger

app.use((req, res, next) => {
    console.log(`Route: ${req.method} - ${req.url}`);
    if (Object.keys(req.body).length) {
        console.log('body:');
        console.log(req.body);
    }
    next();
})

app.get('/check-auth', withAuth, function(req, res) {
    res.send('The password is potato');
});


// ------------ ROUTES ------------

app.get('/', async (req, res) => {
    try {
        res.send('This is the right place, hello, nice job!');
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