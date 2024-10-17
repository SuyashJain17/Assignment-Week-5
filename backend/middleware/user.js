const jwt = require('jsonwebtoken');
const {JWT_USER_PASSWORD} = require('../config');
const {JWT_ADMIN_PASSWORD} = require('../config');

function userMiddleware(req, res, next) {
    const token = req.headers.token;
    
    const decode = jwt.verify(token, JWT_USER_PASSWORD);

    if(decode) {
        req.userId = decode.id;
        next();
    } else {
        res.status(403).json ({
            message: "You are not signed up"
        })
    }
}
function adminMiddleware(req, res, next) {
    const token = req.headers.token;
    console.log(token);
    console.log(JWT_ADMIN_PASSWORD);
    
    const decode = jwt.verify(token, JWT_ADMIN_PASSWORD);

    if(decode) {
        req.adminId = decode.id;
        next();
    } else {
        res.status(403).json ({
            message: "You are not signed up"
        })
    }
}

module.exports = {
    userMiddleware: userMiddleware,
    adminMiddleware: adminMiddleware
}