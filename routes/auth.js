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

// const googlePassportLoginCallback = function(req, res, next) {
//     passport.authenticate('google', function(err, user, info) {
//         if (err) {
//         console.error('Error:', err);
//         return res.status(500).send('An error occurred during authentication');
//         }
        
//         if (!user) {
//         console.error('Authentication failed:', info);
//         return res.status(401).send('Authentication failed');
//         }

//         // Log the user in if authentication is successful
//         req.logIn(user, function(err) {
//         if (err) {
//             console.error('Error logging in:', err);
//             return res.status(500).send('An error occurred while logging in');
//         }
//         return res.redirect(process.env.CLIENT_URL); // Replace this with your success route
//         });
//     })(req, res, next);
// }
const googlePassportLoginCallback = passport.authenticate('google', {
    successRedirect: `${process.env.CLIENT_URL}`,
    failureRedirect: '/login-failure'
});

const linkedInPassportLogin = passport.authenticate('linkedin');
const linkedInPassportLoginCallback = passport.authenticate('linkedin', {
    successRedirect: `${process.env.CLIENT_URL}`,
    failureRedirect: '/login-failure'
});

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
router.get('/google/callback', googlePassportLoginCallback);

router.get('/linkedin', linkedInPassportLogin);
router.get('/linkedin/callback', linkedInPassportLoginCallback);

router.get('/login/success', loginSuccess);

router.post('/signup', localSignup);
router.post('/login', localPassportLogin);
router.get('/logout', logout);

module.exports = router;
