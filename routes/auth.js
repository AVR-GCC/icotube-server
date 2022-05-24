const express = require('express');
require('dotenv/config');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const bcrypt = require('bcrypt');
const Users = require('../models/User');
const { omit } = require('lodash');

const router = express.Router();

const signup = async (req, res) => {
    try {
        let { email, password } = req.body;
        const hash = await bcrypt.hash(password, 10);
        let user = await new Users({
            email,
            hash
        }).save();
        // generate token
        const payload = { email };
        const secret = process.env.JWT_SECRET;
        const token = jwt.sign(payload, secret, {
            expiresIn: '1h'
        });
        res.cookie('token', token, { httpOnly: true });
        res.json({ user: omit(user, ['hash']) });
    } catch (err) {
        console.log('signup error:', err);
        res.send({
            success: false,
            error: err
        });
    }
}

const login = async (req, res) => {
    try {
        let { email, password, googleToken, imageUrl } = req.body;
        let userId, googleEmail, user;
        // confirm user
        if (googleToken) {
            const clientId = process.env.OAUTH_CLIENT_ID;
            const client = new OAuth2Client(clientId);
            const ticket = await client.verifyIdToken({
                idToken: googleToken,
                audience: clientId
            });
            const payload = ticket.getPayload();
            userId = payload.sub;
            googleEmail = payload.email;
            if (!userId || !googleEmail) {
                res.status(401).json({
                    error: 'Incorrect email or password'
                });
                return;
            }
            user = await Users.findOne({ email: googleEmail });
            if (!user) {
                user = await new Users({
                    email: googleEmail,
                    imageUrl,
                    hash: null
                }).save();
            }
            email = googleEmail;
        } else {
            user = await Users.findOne({ email });
            if (!user) {
                res.status(401).json({
                    error: 'Incorrect email or password'
                });
                return;
            }
            const compare = await bcrypt.compare(password, user.hash);
            if (!compare) {
                res.status(401).json({
                    error: 'Incorrect email or password'
                });
                return;
            }
        }
        if (user && imageUrl && !user.imageUrl) {
            user.imageUrl = imageUrl;
            await user.save();
        }
        // generate token
        const payload = { email };
        const secret = process.env.JWT_SECRET;
        const token = jwt.sign(payload, secret, {
            expiresIn: '1h'
        });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production'? true: false });
        res.json({ user: omit(user._doc, 'hash') });
    } catch (err) {
        console.log('login error:', err);
        res.send({
            success: false,
            error: err
        });
    }
};

const logout = async (req, res) => {
    try {
        req.logout();
        res.redirect(process.env.CLIENT_URL);
        console.log('User Logged out');
    } catch (err) {
        console.log('logout error:', err);
        res.send({
            success: false,
            error: err
        });
    }
}

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);


router.get('/login/success', async (req, res) => {
    console.log('login success!!!@@@@@!!! req.user', req.user);
    if (req.user) {
        res.status(200).json({
            success: true,
            message: "successfull",
            user: req.user,
            cookies: req.cookies
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'No user connected'
        });
    }
});

router.get('/login/failed', (req, res) => {
    console.log('login failed!!!!!!!!!', req);
    res.status(401).json({
        success: false,
        message: 'failed!'
    });
});

router.get('/google', (req, res, next) => {
    console.log('in the google route!@##!@!#@ authenticating.');
    const authResult = passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next)
    console.log('authResult', authResult);
    console.log('done!!! returning');
    return authResult;
});

router.get('/google/callback', (req, res, next) => {
    console.log('in the google callback route%^$%$^$%&^&%^ authenticating.');
    passport.authenticate('google', {
        successRedirect: process.env.CLIENT_URL,
        failureRedirect: '/login/failed'
    })(req, res, next);
    console.log('done!!');
});

module.exports = router;