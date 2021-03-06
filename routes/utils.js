const jwt = require('jsonwebtoken');
const { findIndex } = require('lodash');


const freePostWhitelist = [
    'ogoun.d@gmail.com',
    'namershahar@gmail.com',
    'icotube@proton.me'
];

const defined = (value) => value !== null && value !== undefined;

const wait = (miliseconds) => {
    return new Promise((resolve) => {
        setTimeout(resolve, miliseconds);
    });
};

const withAuth = async (req, res, next) => {
    let token = req.cookies.token;
    if (!token) {
        const authorizationIndex = findIndex(req.rawHeaders, h => h === 'Authorization');
        if (authorizationIndex !== -1) token = req.rawHeaders[authorizationIndex + 1];
    }
    if (!token) {
        res.status(401).send('Unauthorized: No token provided');
    } else {
        try {
            const secret = process.env.JWT_SECRET;
            const decoded = await jwt.verify(token, secret);
            req.email = decoded.email;
            next();
        } catch (e) {
            console.log('authorization failed', e);
            res.status(401).send('Unauthorized: Token expired');
        }
    }
};

const oneMinute = 60 * 1000;

const oneHour = 60 * oneMinute;

const oneDay = 24 * oneHour;

module.exports = {
    defined,
    wait,
    withAuth,
    oneMinute,
    oneHour,
    oneDay,
    freePostWhitelist
}