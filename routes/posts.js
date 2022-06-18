const express = require('express');
const Posts = require('../models/Post');
const { withAuth, wait } = require('./utils');

const router = express.Router();

const freePostWhitelist = [
    'ogoun.d@gmail.com',
    'namershahar@gmail.com'
];

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
        const {
            name = '',
            email,
            title = '',
            type = 'Platform',
            shortDescription = '',
            description = '',
            startDate = new Date(),
            endDate = new Date(),
            ticker = '',
            tokenType = 'ERC20',
            amountPerUser = 0,
            softCap = 0,
            cap = 0,
            totalTokens = 0,
            availableTokens = 0,
            minParticipation = 0,
            maxParticipation = 0,
            accepts = 'BTC',
            isWhitelist = false,
            officialChat = '',
            github = '',
            bitcoinTalk = '',
            logo = '',
            homepage = '',
            videoUrl = ''
        } = { ...req.body };
        const autoPublish = freePostWhitelist.includes(req.email);
        const post = new Posts({
            active: autoPublish,
            paymentHooks: [],
            created: new Date(),
            name,
            email,
            title,
            type,
            shortDescription,
            description,
            startDate,
            endDate,
            ticker,
            tokenType,
            amountPerUser,
            softCap,
            cap,
            totalTokens,
            availableTokens,
            minParticipation,
            maxParticipation,
            accepts,
            isWhitelist,
            officialChat,
            github,
            bitcoinTalk,
            logo,
            homepage,
            videoUrl
        });
        // console.log('about to wait!');
        // await wait(10000);
        // console.log('finished waiting...');
        await post.save();
        res.json({
            success: true,
            post,
            autoPublish
        });
    } catch (err) {
        res.json({
            success: false,
            error: err
        });
    }
});

module.exports = router;