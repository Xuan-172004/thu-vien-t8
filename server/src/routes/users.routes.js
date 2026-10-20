const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/avatars');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

var upload = multer({ storage: storage });

const userController = require('../controller/user.controller');
const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

router.post('/register', asyncHandler(userController.createUser));
router.get('/auth', authUser, asyncHandler(userController.auth));
router.post('/login', asyncHandler(userController.login));
router.post('/logout', authUser, asyncHandler(userController.logout));
router.get('/refresh-token', asyncHandler(userController.refreshToken));
router.post('/login-google', asyncHandler(userController.loginGoogle));
router.post('/forgot-password', asyncHandler(userController.forgotPassword));
router.post('/reset-password', asyncHandler(userController.resetPassword));
router.post('/change-password', authUser, asyncHandler(userController.changePassword));
router.put('/update', authUser, asyncHandler(userController.updateUser));
router.post('/upload-avatar', authUser, upload.single('avatar'), asyncHandler(userController.uploadAvatar));

// Admin management routes
router.get('/admin/users', authAdmin, asyncHandler(userController.getAllUser));
router.post('/admin/users', authAdmin, asyncHandler(userController.createUserAdmin));
router.put('/admin/users/lock/:id', authAdmin, asyncHandler(userController.toggleLockUser));
router.put('/admin/users/:id', authAdmin, asyncHandler(userController.updateUserAdmin));
router.delete('/admin/users/:id', authAdmin, asyncHandler(userController.deleteUser));

module.exports = router;
