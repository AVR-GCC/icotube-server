const express = require('express');
const { freePostWhitelist } = require('./utils');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        console.log('req.session', req.session);
        if (req.session.count) {
            req.session.count++;
        } else {
            req.session.count = 1;
        }
        res.send({
            freePostWhitelist
        });
    } catch (err) {
        console.log('get errorr!!', err);
        res.send({
            success: false,
            error: err
        });
    }
});

module.exports = router;