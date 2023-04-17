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

const sslRedirect = require('heroku-ssl-redirect');
const passport = require('passport');
require('./config/passport.js');

const app = express();
const port = process.env.PORT || 5000;

// ------------ DB ------------

const dbLink = process.env.DB_LINK;

mongoose.set('strictQuery', false);

mongoose.connect(dbLink).then(() => console.log('Connected to DB!: ', dbLink));

// ------------ parsing ------------

const cookieSecret = process.env.COOKIE_SECRET;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser(cookieSecret));

// ------------ ssl redirect ------------

app.set('trust proxy', 1);

// if(process.env.NODE_ENV === 'prod') {
//     app.use((req, res, next) => {
//         const bothParts = req.rawHeaders[11].split(':');
//         const proto = bothParts[0];
//         if (proto !== 'https') {
//             console.log('redirecting to:', `https:${bothParts[1]}`);
//             res.redirect(`https:${bothParts[1]}`);
//         } else {
//             next();
//         }
//     })
// }

app.use(sslRedirect.default());

// ------------ cors ------------

const corsConfig = {
    origin: process.env.CLIENT_URL,
    credentials: true,
};

app.use(cors(corsConfig));
app.options('*', cors(corsConfig));

// ------------ session ------------

const sessionStore = MongoStore.create({
    mongoUrl: dbLink,
    autoRemove: 'interval',
    autoRemoveInterval: 120,
    crypto: {
        secret: cookieSecret
    }
});

const sessionMiddleware = session({
    name: 'session',
    secret: cookieSecret,
    saveUninitialized: false,
    resave: false,
    store: sessionStore,
    cookie: {
        sameSite: 'lax',
        maxAge: oneDay,
        path: '/',
        secure: process.env.NODE_ENV === 'prod',
        httpOnly: true
    }
});

app.use(sessionMiddleware);

// ------------ static ------------

app.use(express.static(path.join(__dirname, 'public')));

// ------------ passport ------------

app.use(passport.initialize());
app.use(passport.session());

// test passport
// app.use((req, _, next) => {
//     console.log('-=-=-=-=-=-=-=-', req.url, '-=-=-=-=-=-=-=-');
//     console.log('session:', req.sessionID, req.session);
//     // console.log('user:', req.user);
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