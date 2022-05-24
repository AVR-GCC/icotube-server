const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
require('dotenv/config');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const path = require('path');
require('./passport.js');
const cookieSession = require('cookie-session');
// const session = require('express-session');
// const SQLiteStore = require('connect-sqlite3')(session);
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

// session

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieSession({ 
    key: 'session',
    secret: 'cookieSecret',
    cookie: {
        maxAge: oneDay
    }
}));
// app.use(session({
//     secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
//     saveUninitialized:true,
//     cookie: { maxAge: oneDay },
//     resave: false 
// }));
app.use(cors(corsConfig));
app.options('*', cors(corsConfig));

// ------------ MIDDLEWARE ------------

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});

app.use(passport.initialize());
app.use(passport.session());

app.use(passport.authenticate('session'));

app.get('/check-auth', withAuth, function(req, res) {
    res.send('The password is potato');
});

// logger

app.use(morgan('dev'));


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