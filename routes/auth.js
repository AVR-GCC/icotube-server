const express = require('express');
const passport = require('passport');
const crypto = require('crypto');
const User = require('../models/User');
const { generatePassword } = require('../utils/auth');
const { sendConfirmationEmail } = require('../utils/email');
const { toClientUser, wait, isAuth, emailConfirmationMessage } = require('./utils');

const router = express.Router();

const localPassportLogin = passport.authenticate('local', {
    failureRedirect: '/auth/login-failure',
    successRedirect: '/auth/login-success',
    failureFlash: true
});

const localSignup = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { salt, hash } = generatePassword(password);
        const token = crypto.randomBytes(20).toString('hex');
        await new User({ email, hash, salt, token }).save();
        sendConfirmationEmail(token, email);
        res.send({ success: true });
    } catch (err) {
        console.log('signup error:', err);
        res.send({
            success: false,
            error: err.message ? err : { message: err }
        });
    }
};

const confirmEmail = async (req, res) => {
    const { token } = req.query;
    const user = await User.findOne({ token });
    if (!user || user.emailConfirmed) return res.send({ success: false });
    user.emailConfirmed = true;
    await user.save();
    req.login(user, 'local', (err) => {
        if (err) {
            return res.send({
                success: false,
                error: { message: err.message }
            });
        }
        res.redirect(process.env.CLIENT_URL);
    })
}

const resendConfirmationEmail = async (req, res) => {
    const { email } = req.query;
    const user = await User.findOne({ email });
    if (!user || user.emailConfirmed) return res.send({ success: false });
    console.log('user', user);
    sendConfirmationEmail(user.token, email);
    res.send({ success: true });
}

const googlePassportLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

const googlePassportLoginCallback = passport.authenticate('google', {
    successRedirect: `${process.env.CLIENT_URL}`,
    failureRedirect: '/login-failure'
});

const linkedInPassportLogin = passport.authenticate('linkedin');
const linkedInPassportLoginCallback = passport.authenticate('linkedin', {
    successRedirect: `${process.env.CLIENT_URL}`,
    failureRedirect: '/login-failure',
});

router.get('/login-success', (req, res) => {
    res.send({
        success: true,
        user: toClientUser(req.user),
        message: 'logged in successfully'
    });
});

router.get('/login-failure', (req, res) => {
    const message = req.flash('error')[0];
    res.send({
        success: false,
        showResend: message === emailConfirmationMessage,
        error: { message }
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
            error: err.message ? err : { message: err }
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
router.get('/confirm', confirmEmail);
router.get('/resend-confirmation', resendConfirmationEmail);

router.post('/login', localPassportLogin);
router.get('/logout', logout);

module.exports = router;
