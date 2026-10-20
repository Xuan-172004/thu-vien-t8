const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bookController = require('../controller/book.controller');
const { asyncHandler, authAdmin } = require('../auth/checkAuth');

// Configure Multer for Book / Category image uploads
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
        cb(null, 'cat-' + uniqueSuffix + ext);
    },
});

const upload = multer({ storage });

// Reader routes
router.get('/', asyncHandler(bookController.getAllBooks));
router.get('/categories', asyncHandler(bookController.getCategories));
router.get('/:id', asyncHandler(bookController.getBookById));

// Admin management routes for books
router.get('/admin/list', authAdmin, asyncHandler(bookController.getAllBooksAdmin));
router.post('/', authAdmin, asyncHandler(bookController.createBook));
router.put('/:id', authAdmin, asyncHandler(bookController.updateBook));
router.delete('/:id', authAdmin, asyncHandler(bookController.deleteBook));
router.put('/visibility/:id', authAdmin, asyncHandler(bookController.toggleVisibilityBook));

// Image upload for categories / books (supports single or multiple images)
router.post('/upload', authAdmin, upload.any(), (req, res) => {
    const files = req.files || (req.file ? [req.file] : []);
    if (files.length === 0) {
        return res.status(400).json({ success: false, message: 'Vui lòng chọn file ảnh hợp lệ' });
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const uploadedUrls = files.map(file => `${baseUrl}/uploads/${file.filename}`);
    return res.status(200).json({
        success: true,
        message: 'Tải ảnh lên thành công',
        metadata: {
            url: uploadedUrls[0],
            urls: uploadedUrls,
            files: files.map(file => ({
                filename: file.filename,
                url: `${baseUrl}/uploads/${file.filename}`,
            })),
        },
    });
});

// Admin management routes for categories
router.post('/categories', authAdmin, asyncHandler(bookController.createCategory));
router.put('/categories/:id', authAdmin, asyncHandler(bookController.updateCategory));
router.delete('/categories/:id', authAdmin, asyncHandler(bookController.deleteCategory));

// Seeder tool route for admin
router.post('/admin/seed-library-data', authAdmin, asyncHandler(bookController.seedLibraryData));

// Physical copy routes
router.post('/copies', authAdmin, asyncHandler(bookController.addBookCopy));
router.put('/copies/status', authAdmin, asyncHandler(bookController.updateCopyStatus));

module.exports = router;
