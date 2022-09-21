const express = require('express');
const Alert = require('../models/Alert');

const router = express.Router();

router.put('/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const alert = await Alert.findOne({ email });
        if (!alert) {
            new Alert({ email }).save();
        }
        res.json({
            success: true
        });
    } catch (err) {
        res.json({
            success: false,
            error: err
        });
    }
});

router.delete('/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const alert = await Alert.findOne({ email });
        if (alert) {
            alert.remove();
        }
        res.json({
            success: true
        });
    } catch (err) {
        res.json({
            success: false,
            error: err
        });
    }
});


module.exports = router;