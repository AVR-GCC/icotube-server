const express = require('express');
const { get } = require('lodash');
const Payments = require('../models/Payment');
const Posts = require('../models/Post');
const { wait } = require('./utils');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const data = await Payments.find({});
        res.send({
            success: true,
            data
        });
    } catch (err) {
        console.log('get errorr!!', err);
        res.send({
            success: false,
            error: err
        });
    }
});

router.post('/', async (req, res) => {
    try {
        console.log('-=-=-=-=-=-=-=-=-=-=-=- new hook -=-=-=-=-=-=-=-=-=-=-=-');
        const email = get(req, 'body.event.data.metadata.email');
        const type = get(req, 'body.event.type');
        console.log('email', email);
        console.log('type', type);
        const payment = new Payments({
            ...req.body
        });
        await payment.save();
        console.log('saved the payment:', payment._id);
        const lastPost = await Posts.findOne({ email });
        lastPost.paymentHooks = [...lastPost.paymentHooks, payment._id];
        if (type === 'charge:confirmed') {
            console.log('charge confirmed, post ', lastPost._id, ' is activated');
            lastPost.active = true;
        }
        await lastPost.save();
        console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
        res.json({
            success: true,
            payment
        });
    } catch (err) {
        console.log('error$$', err);
        res.json({
            success: false,
            error: err
        });
    }
});

module.exports = router;