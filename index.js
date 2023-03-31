const express = require('express');

const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');

const cors = require('cors');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const session = require('express-session');

const morgan = require('morgan');

require('dotenv/config');
const postsRouter = require('./routes/posts');
const paymentsRouter = require('./routes/payments');
const configRouter = require('./routes/config');
const authRouter = require('./routes/auth');
const alertRouter = require('./routes/alert');

const { isAuth, oneDay } = require('./routes/utils');

const path = require('path');

// const sslRedirect = require('heroku-ssl-redirect');
const passport = require('passport');
require('./config/passport.js');

const app = express();
const port = process.env.PORT || 5000;

// ------------ DB ------------

const dbLink = process.env.DB_LINK;

mongoose.set('strictQuery', false);

mongoose.connect(dbLink).then(() => console.log('Connected to DB!: ', dbLink));

// ------------ cors ------------

const corsConfig = {
    origin: true,
    credentials: true,
};

app.use(cors(corsConfig));
app.options('*', cors(corsConfig));

// ------------ parsing ------------

const cookieSecret = process.env.COOKIE_SECRET;

app.use(bodyParser.json());
app.use(cookieParser(cookieSecret));

// ------------ session ------------

app.set('trust proxy', 1);

const sessionStore = MongoStore.create({
    mongoUrl: dbLink,
    crypto: {
        secret: cookieSecret
    }
});

const sessionMiddleware = session({
    name: 'session',
    secret: cookieSecret,
    saveUninitialized: true,
    resave: false,
    store: sessionStore,
    cookie: {
        sameSite: process.env.NODE_ENV === 'prod' ? 'none' : 'lax',
        maxAge: oneDay,
        path: "/",
        secure: process.env.NODE_ENV === 'prod',
        httpOnly: true
    }
});

app.use(sessionMiddleware);

// ------------ static ------------

app.use(express.static(path.join(__dirname, 'public')));

// ------------ align headers ------------

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    next();
});

// ------------ passport ------------

app.use(passport.initialize());
app.use(passport.session());

// test passport
// app.use((req, _, next) => {
//     console.log('session:', req.session);
//     console.log('user:', req.user);
//     next();
// });

// ------------ log ------------

app.use(morgan('dev'));

// ------------ routes ------------

app.get('/check-auth', isAuth, function(req, res) {
    res.send('The password is potato');
});

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
app.use('/alert', alertRouter);

app.listen(port, () => {
    console.log(`ICOTube listening at http://localhost:${port}`)
});

// app.use(sslRedirect.default());
// if(process.env.NODE_ENV === 'production') {
//     app.use((req, res, next) => {
//         if (req.header('x-forwarded-proto') !== 'https')
//             res.redirect(`https://${req.header('host')}${req.url}`);
//         else
//             next();
//     })
// }