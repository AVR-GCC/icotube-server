const express = require('express');
const Posts = require('../models/Post');
const { withAuth, defined, wait, freePostWhitelist } = require('./utils');

const router = express.Router();

router.get('/:_id', async (req, res) => {
    try {
        const { _id } = req.params;
        const posts = await Posts.find({ _id, active: true });
        if (posts.length) {
            res.send({
                success: true,
                data: posts[0]
            });
        } else {
            res.send({
                success: false,
                error: 'Post not found'
            });
        }
    } catch (err) {
        console.log('get errorr!!', err);
        res.send({
            success: false,
            error: err
        });
    }
});

router.delete('/:_id', withAuth, async (req, res) => {
    try {
        const { _id } = req.params;
        const posts = await Posts.find({ _id, active: true });
        const canEdit = posts.length && (posts[0].email === req.email || freePostWhitelist.includes(req.email));
        if (canEdit) {
            posts[0].active = false;
            await posts[0].save();
            res.send({ success: true });
            return;
        }
        res.send({
            success: false,
            error: "post not found"
        });
    } catch (err) {
        console.log('get errorr!!', err);
        res.send({
            success: false,
            error: err
        });
    }
});

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
            _id = null,
            email,
            title = '',
            type = 'Platform',
            typeOther = '',
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
            isWhitelist = null,
            officialChat = '',
            github = '',
            bitcoinTalk = '',
            logo = '',
            homepage = '',
            videoUrl = ''
        } = { ...req.body };
        let post;
        if (_id && (req.email === email || freePostWhitelist.includes(req.email))) {
            post = await Posts.findById(_id);
            if (post.email !== email) {
                post = new Posts();
            }
        } else {
            post = new Posts();
        }
        const autoPublish = freePostWhitelist.includes(req.email);
        post.active = post.active || autoPublish;
        post.paymentHooks = post.paymentHooks || [];
        post.email = email || post.email;
        post.title = title || post.title;
        const endType = type === 'Other' ? typeOther : type;
        post.type = endType || post.type;
        post.shortDescription = shortDescription || post.shortDescription;
        post.description = description || post.description;
        post.startDate = startDate || post.startDate;
        post.endDate = endDate || post.endDate;
        post.ticker = ticker || post.ticker;
        post.tokenType = tokenType || post.tokenType;
        post.amountPerUser = amountPerUser || post.amountPerUser;
        post.softCap = softCap || post.softCap;
        post.cap = cap || post.cap;
        post.totalTokens = totalTokens || post.totalTokens;
        post.availableTokens = availableTokens || post.availableTokens;
        post.minParticipation = minParticipation || post.minParticipation;
        post.maxParticipation = maxParticipation || post.maxParticipation;
        post.accepts = accepts || post.accepts;
        post.isWhitelist = defined(isWhitelist) ? isWhitelist : post.isWhitelist;
        post.officialChat = officialChat || post.officialChat;
        post.github = github || post.github;
        post.bitcoinTalk = bitcoinTalk || post.bitcoinTalk;
        post.logo = logo || post.logo;
        post.homepage = homepage || post.homepage;
        post.videoUrl = videoUrl || post.videoUrl;
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