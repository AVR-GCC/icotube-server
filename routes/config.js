const express = require('express');
require('dotenv/config');
const { freePostWhitelist } = require('./utils');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
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