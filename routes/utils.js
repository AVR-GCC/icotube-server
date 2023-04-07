const { omit } = require("lodash");

const freePostWhitelist = process.env.FREE_POST_WHITELIST.split(';');

const toClientUser = (user) => {
    console.log('user', user);
    const clientUser = omit(user, ['hash', 'salt']);
    console.log('clientUser', clientUser);
    return clientUser;
}

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

const isAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).json({ msg: 'Unauthorized' });
    }
}

const oneMinute = 60 * 1000;

const oneHour = 60 * oneMinute;

const oneDay = 24 * oneHour;

module.exports = {
    toClientPost,
    defined,
    wait,
    isAuth,
    toClientUser,
    oneMinute,
    oneHour,
    oneDay,
    freePostWhitelist
};