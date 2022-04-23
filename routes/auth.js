const express = require('express');
require('dotenv/config');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Users = require('../models/User');

const router = express.Router();

router.post('/signup', async (req, res) => {
    try {
        let { email, password } = req.body;
        const hash = await bcrypt.hash(password, 10);
        const user = await new Users({
            email,
            hash
        }).save();
        // generate token
        const payload = { email };
        const secret = process.env.JWT_SECRET;
        const token = jwt.sign(payload, secret, {
            expiresIn: '1h'
        });
        res.cookie('token', token, { httpOnly: true }).sendStatus(200);
    } catch (err) {
        console.log('get errorr!!', err);
        res.send({
            success: false,
            error: err
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        let { email, password, googleToken } = req.body;
        let userId, googleEmail;
        // confirm user
        if (googleToken) {
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
            const user = await Users.findOne({ email: googleEmail });
            if (!user) {
                const user = await new Users({
                    email: googleEmail,
                    hash: null
                }).save();
            }
            email = googleEmail;
        } else {
            const user = await Users.findOne({ email });
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
        // generate token
        const payload = { email };
        const secret = process.env.JWT_SECRET;
        const token = jwt.sign(payload, secret, {
            expiresIn: '1h'
        });
        res.cookie('token', token, { httpOnly: true }).sendStatus(200);
    } catch (err) {
        console.log('get errorr!!', err);
        res.send({
            success: false,
            error: err
        });
    }
});

module.exports = router;