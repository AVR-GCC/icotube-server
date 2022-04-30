const jwt = require('jsonwebtoken');

const wait = (miliseconds) => {
    return new Promise((resolve) => {
        setTimeout(resolve, miliseconds);
    });
}

const withAuth = async (req, res, next) => {
    const token = req.cookies.token;
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
}

module.exports = {
    wait,
    withAuth
}