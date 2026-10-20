const express = require('express');
const router = express.Router();
const copyController = require('../controller/copy.controller');
const { asyncHandler, authAdmin } = require('../auth/checkAuth');

// Book Copies & ĐKCB Barcode management
router.get('/', authAdmin, asyncHandler(copyController.getAllCopies));
router.post('/batch-create', authAdmin, asyncHandler(copyController.batchCreateCopies));
router.put('/transfer/:id', authAdmin, asyncHandler(copyController.transferCopy));
router.put('/condition/:id', authAdmin, asyncHandler(copyController.updateCondition));
router.delete('/:id', authAdmin, asyncHandler(copyController.deleteCopy));

// Warehouse routes
router.get('/warehouses', authAdmin, asyncHandler(copyController.getAllWarehouses));
router.post('/warehouses', authAdmin, asyncHandler(copyController.createWarehouse));
router.put('/warehouses/:id', authAdmin, asyncHandler(copyController.updateWarehouse));
router.delete('/warehouses/:id', authAdmin, asyncHandler(copyController.deleteWarehouse));

// Shelf routes
router.get('/shelves', authAdmin, asyncHandler(copyController.getAllShelves));
router.post('/shelves', authAdmin, asyncHandler(copyController.createShelf));
router.put('/shelves/:id', authAdmin, asyncHandler(copyController.updateShelf));
router.delete('/shelves/:id', authAdmin, asyncHandler(copyController.deleteShelf));

module.exports = router;
