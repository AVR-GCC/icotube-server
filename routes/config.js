const express = require('express');
const { freePostWhitelist } = require('./utils');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        res.send({ success: true });
    } catch (err) {
        console.log('get errorr!!', err);
        res.send({
            success: false,
            error: err
        });
    }
});

module.exports = router;