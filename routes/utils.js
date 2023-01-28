const jwt = require('jsonwebtoken');
const { findIndex } = require('lodash');


const freePostWhitelist = process.env.FREE_POST_WHITELIST.split(';');

const toClientPost = (post, userId) => {
    const res = { ...post._doc };
    res.isLiked = userId ? res.likes.includes(userId) : false;
    res.likes = res.likes.length;
    return res;
}

const defined = (value) => value !== null && value !== undefined;

const wait = (miliseconds) => {
    return new Promise((resolve) => {
        setTimeout(resolve, miliseconds);
    });
};

const getEmail = async (req) => {
    let email;
    let token = req.cookies.token;
    if (!token) {
        const authorizationIndex = findIndex(req.rawHeaders, h => h === 'Authorization');
        if (authorizationIndex !== -1) token = req.rawHeaders[authorizationIndex + 1];
    }
    if (token) {
        const secret = process.env.JWT_SECRET;
        let decoded;
        try {
            decoded = await jwt.verify(token, secret);
            email = decoded.email;
        } catch (e) {
            email = null;
        }
    }
    return email;
};

const getAuth = async (req, _, next) => {
    req.email = await getEmail(req);
    next();
};

const withAuth = async (req, res, next) => {
    const email = await getEmail(req);
    if (!email) {
        res.status(401).send('Unauthorized: No token provided');
        return;
    }
    req.email = email;
    next();
};

const oneMinute = 60 * 1000;

const oneHour = 60 * oneMinute;

const oneDay = 24 * oneHour;

module.exports = {
    toClientPost,
    defined,
    wait,
    withAuth,
    getAuth,
    oneMinute,
    oneHour,
    oneDay,
    freePostWhitelist
}