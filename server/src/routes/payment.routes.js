const express = require('express');
const router = express.Router();
const paymentController = require('../controller/payment.controller');
const { asyncHandler } = require('../auth/checkAuth');

router.post('/deposit', asyncHandler(paymentController.createDeposit));
router.get('/vnpay-return', asyncHandler(paymentController.vnpayCallback));
router.get('/momo-return', asyncHandler(paymentController.momoCallback));
router.get('/history', asyncHandler(paymentController.getHistory));

module.exports = router;
