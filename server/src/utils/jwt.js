const jwt = require('jsonwebtoken');
const { AuthFailureError } = require('../core/error.response');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || process.env.SECRET_CRYPTO || 'bookrent_secret_jwt_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'bookrent_refresh_secret_jwt_key_2026';

const createApiKey = async (userId) => {
    return true;
};

const createToken = async (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: '1d',
    });
};

const createRefreshToken = async (payload) => {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: '7d',
    });
};

const verifyToken = async (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        try {
            return jwt.verify(token, JWT_REFRESH_SECRET);
        } catch (err) {
            throw new AuthFailureError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        }
    }
};

module.exports = {
    createApiKey,
    createToken,
    createRefreshToken,
    verifyToken,
};
