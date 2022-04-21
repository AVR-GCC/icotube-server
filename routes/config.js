const express = require('express');
require('dotenv/config');

const router = express.Router();

router.get('/', async (req, res) => {
    const clientId = process.env.OAUTH_CLIENT_ID;
    try {
        res.send({
            clientId
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