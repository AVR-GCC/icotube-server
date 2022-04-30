const express = require('express');
const Posts = require('../models/Post');
const { withAuth } = require('./utils');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const data = await Posts.find({ active: true });
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

router.put('/', withAuth, async (req, res) => {
    try {
        const defaults = {
            description: '',
            fundraisingGoal: 0,
            isWhitelist: false,
            tokenType: 'ERC20',
            homepage: '',
            icoOrAirdrop: 'ICO',
            startDate: Date.now,
            endDate: Date.now
        }
        const {
            title,
            email,
            description,
            fundraisingGoal,
            isWhitelist,
            ticker,
            tokenType,
            homepage,
            videoUrl,
            startDate,
            endDate
        } = { ...defaults, ...req.body };
        const post = new Posts({
            active: false,
            title,
            email,
            description,
            fundraisingGoal,
            isWhitelist,
            ticker,
            tokenType,
            homepage,
            videoUrl,
            startDate,
            endDate,
            created: new Date()
        });
        // console.log('about to wait!');
        // await wait(10000);
        // console.log('finished waiting...');
        await post.save();
        res.json({
            success: true,
            post
        });
    } catch (err) {
        res.json({
            success: false,
            error: err
        });
    }
});

module.exports = router;