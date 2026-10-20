const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const DigitalDocumentController = require('../controller/digitalDocument.controller');
const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

// Configure Multer storage
const uploadDir = path.join(__dirname, '../../uploads');
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
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    },
});

const upload = multer({ storage });

// Admin Endpoints
router.get('/admin', authAdmin, asyncHandler(DigitalDocumentController.getAllAdmin));
router.post('/admin', authAdmin, asyncHandler(DigitalDocumentController.createAdmin));
router.put('/admin/:id', authAdmin, asyncHandler(DigitalDocumentController.updateAdmin));
router.delete('/admin/:id', authAdmin, asyncHandler(DigitalDocumentController.deleteAdmin));
router.patch('/admin/:id/toggle-status', authAdmin, asyncHandler(DigitalDocumentController.toggleStatusAdmin));

// Public Endpoints (Khách vãng lai & Độc giả)
router.get('/public', asyncHandler(DigitalDocumentController.getAllPublic));
router.get('/public/:id', asyncHandler(DigitalDocumentController.getDetailPublic));

// User Purchase & Ownership Endpoints
router.get('/check-ownership/:id', authUser, asyncHandler(DigitalDocumentController.checkOwnership));
router.post('/purchase/:id', authUser, asyncHandler(DigitalDocumentController.purchase));
router.get('/my-purchases', authUser, asyncHandler(DigitalDocumentController.getMyPurchases));

// File Upload Endpoint
router.post('/upload', authAdmin, upload.single('file'), asyncHandler(DigitalDocumentController.uploadFile));

module.exports = router;
