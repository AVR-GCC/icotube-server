const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const { generatePassword } = require('../utils/auth');
const { toClientUser, wait, isAuth } = require('./utils');

const router = express.Router();

const localPassportLogin = passport.authenticate('local', {
    failureRedirect: '/auth/login-failure',
    successRedirect: '/auth/login-success'
});

const localSignup = async (req, res, next) => {
    try {
        let { email, password } = req.body;
        const { salt, hash } = generatePassword(password);
        await new User({ email, hash, salt }).save();
        localPassportLogin(req, res, next);
    } catch (err) {
        console.log('signup error:', err);
        res.send({
            success: false,
            error: err
        });
    }
};

const googlePassportLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

router.get('/login-success', (req, res, next) => {
    res.send({
        success: true,
        user: toClientUser(req.user),
        message: 'logged in successfully'
    });
});

router.get('/login-failure', (req, res, next) => {
    res.send({
        success: false,
        message: 'failed to login'
    });
});

const logout = async (req, res) => {
    try {
        req.session.destroy();
        req.logout();
        res.status(200).json({ success: true });
    } catch (err) {
        console.log('logout error:', err);
        res.send({
            success: false,
            error: err
        });
    }
};

const loginSuccess = async (req, res) => {
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
};

router.get('/google', googlePassportLogin);
router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: '/login-failure'
}), (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}?sessionId=${req.sessionID}`);
});

router.get('/login/success', loginSuccess);

router.post('/signup', localSignup);
router.post('/login', localPassportLogin);
router.get('/logout', logout);

module.exports = router;
