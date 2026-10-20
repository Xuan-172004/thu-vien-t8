const express = require('express');
const router = express.Router();
const EmailController = require('../controller/email.controller');
const { asyncHandler, authUser } = require('../auth/checkAuth');

router.post('/test-send', authUser, asyncHandler(EmailController.sendTestEmail));

module.exports = router;
