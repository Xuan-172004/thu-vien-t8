const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ThesisSubmissionController = require('../controller/thesisSubmission.controller');
const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

// Configure Multer storage for student thesis PDF uploads
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
        cb(null, 'thesis-' + uniqueSuffix + ext);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
});

// 1. Student / User Routes
router.post('/upload', authUser, upload.single('file'), asyncHandler(ThesisSubmissionController.uploadSubmissionFile));
router.post('/submit', authUser, asyncHandler(ThesisSubmissionController.submit));
router.get('/my-submissions', authUser, asyncHandler(ThesisSubmissionController.getMySubmissions));
router.put('/resubmit/:id', authUser, asyncHandler(ThesisSubmissionController.resubmit));

// 2. Admin / Librarian Routes
router.get('/admin/list', authAdmin, asyncHandler(ThesisSubmissionController.getAllAdmin));
router.get('/admin/:id', authAdmin, asyncHandler(ThesisSubmissionController.getDetail));
router.post('/admin/:id/approve', authAdmin, asyncHandler(ThesisSubmissionController.approve));
router.post('/admin/:id/reject', authAdmin, asyncHandler(ThesisSubmissionController.reject));

module.exports = router;
