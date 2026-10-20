const express = require('express');
const router = express.Router();
const NotificationController = require('../controller/notification.controller');
const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

router.get('/', authUser, asyncHandler(NotificationController.getMyNotifications));
router.get('/unread-count', authUser, asyncHandler(NotificationController.getUnreadCount));
router.patch('/:id/read', authUser, asyncHandler(NotificationController.markAsRead));
router.patch('/read-all', authUser, asyncHandler(NotificationController.markAllAsRead));
router.delete('/:id', authUser, asyncHandler(NotificationController.deleteNotification));
router.post('/test-send', authUser, asyncHandler(NotificationController.sendTestNotification));

module.exports = router;
