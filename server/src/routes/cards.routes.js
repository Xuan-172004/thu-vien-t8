const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cardController = require('../controller/card.controller');
const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

// Configure Multer storage for avatars
const uploadDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, 'avatar-' + uniqueSuffix + ext);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Reader routes
router.post('/upload-avatar', authUser, upload.single('avatar'), asyncHandler(cardController.uploadAvatar));
router.post('/register', authUser, asyncHandler(cardController.registerCard));
router.delete('/cancel', authUser, asyncHandler(cardController.cancelCardApplication));
router.get('/my-card', authUser, asyncHandler(cardController.getMyCardInfo));

// Admin routes
router.get('/admin/list', authAdmin, asyncHandler(cardController.getAllCardsAdmin));
router.put('/admin/approve/:id', authAdmin, asyncHandler(cardController.approveCardAdmin));
router.put('/admin/reject/:id', authAdmin, asyncHandler(cardController.rejectCardAdmin));
router.put('/admin/status/:id', authAdmin, asyncHandler(cardController.updateCardStatusAdmin));

module.exports = router;
