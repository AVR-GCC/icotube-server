const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const { generatePassword } = require('../utils/auth');
const { toClientUser, wait } = require('./utils');

const router = express.Router();

const localSignup = async (req, res) => {
    try {
        let { email, password } = req.body;
        const { salt, hash } = generatePassword(password);
        let user = await new User({ email, hash, salt }).save();
        res.send({ success: true, user: toClientUser(user) });
    } catch (err) {
        console.log('signup error:', err);
        res.send({
            success: false,
            error: err
        });
    }
};

router.get('/login-success', (req, res, next) => {
    res.send({
        success: true,
        message: 'logged in successfully'
    });
});

router.get('/login-failure', (req, res, next) => {
    res.send({
        success: false,
        message: 'failed to login'
    });
});

const localLogin = passport.authenticate('local', {
    failureRedirect: '/login-failure',
    successRedirect: 'login-success'
});

const logout = async (req, res) => {
    try {
        console.log('req.logout', req.logout);
        req.logout();
        console.log('logged out!');
        await wait(5000);
        console.log('finished waiting');
        res.redirect(process.env.CLIENT_URL);
    } catch (err) {
        console.log('logout error:', err);
        res.send({
            success: false,
            error: err
        });
    }
};

router.get('/login/success', async (req, res) => {
    if (req.user) {
        res.status(200).json({
            success: true,
            message: "successfull",
            user: toClientUser(req.user)
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'No user connected'
        });
    }
});

router.post('/signup', localSignup);
router.post('/login', localLogin);
router.get('/logout', logout);

module.exports = router;


// router.get('/get-me', withAuth, getMe)

// router.get('/login/failed', (req, res) => {
//     res.status(401).json({
//         success: false,
//         message: 'failed!'
//     });
// });

// router.get('/google', (req, res, next) => {
//     passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next)
// });

// router.get('/google/callback', (req, res, next) => {
//     passport.authenticate('google', {
//         successRedirect: process.env.CLIENT_URL,
//         failureRedirect: '/login/failed'
//     })(req, res, next);
// });
