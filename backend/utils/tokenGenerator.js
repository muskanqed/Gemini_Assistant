const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const generateToken = (userId) => {
    const token = jwt.sign({ userId },process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
    return token;
};

module.exports = { generateToken };
