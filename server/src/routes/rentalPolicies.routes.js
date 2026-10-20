const express = require('express');
const router = express.Router();
const rentalPolicyController = require('../controller/rentalPolicy.controller');
const { asyncHandler, authAdmin } = require('../auth/checkAuth');

router.get('/', asyncHandler(rentalPolicyController.getAllPolicies));
router.get('/:id', asyncHandler(rentalPolicyController.getPolicyById));
router.put('/:id', authAdmin, asyncHandler(rentalPolicyController.updatePolicy));

module.exports = router;
