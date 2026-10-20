const { AuthFailureError } = require('../core/error.response');
const { verifyToken } = require('../utils/jwt');
const { User } = require('../models');

const asyncHandler = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

const authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        if (!token) throw new AuthFailureError('Vui lòng đăng nhập');
        const decoded = await verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

const authAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        if (!token) throw new AuthFailureError('Bạn không có quyền truy cập');
        const decoded = await verifyToken(token);
        const { id } = decoded;
        const findUser = await User.findByPk(id);
        if (!findUser || (!findUser.isAdmin && findUser.role !== 'admin' && findUser.role !== 'superadmin')) {
            throw new AuthFailureError('Bạn không có quyền truy cập');
        }
        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    asyncHandler,
    authUser,
    authAdmin,
};
