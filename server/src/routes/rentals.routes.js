const express = require('express');
const router = express.Router();
const rentalController = require('../controller/rental.controller');
const { asyncHandler, authUser } = require('../auth/checkAuth');

router.post('/', asyncHandler(rentalController.createBorrowOrder));
router.get('/my-rentals', asyncHandler(rentalController.getMyRentalOrders));
router.post('/extend/:id', asyncHandler(rentalController.requestExtension));
router.delete('/cancel/:id', asyncHandler(rentalController.cancelBorrowOrder));

// Admin Approval & Management Routes
router.get('/admin/list', asyncHandler(rentalController.getAllRentalOrdersAdmin));
router.post('/admin/create-counter', asyncHandler(rentalController.createOrderAtCounterAdmin));
router.put('/admin/approve/:id', asyncHandler(rentalController.approveBorrowOrderAdmin));
router.put('/admin/reject/:id', asyncHandler(rentalController.rejectBorrowOrderAdmin));
router.put('/admin/handover/:id', asyncHandler(rentalController.confirmHandoverAdmin));
router.put('/admin/return/:id', asyncHandler(rentalController.processReturnAdmin));

module.exports = router;
