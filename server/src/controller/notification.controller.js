const notificationService = require('../services/notification.service');

class NotificationController {
    // Lấy danh sách thông báo của user
    async getMyNotifications(req, res) {
        const result = await notificationService.getUserNotifications(req.user.id, req.query);
        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách thông báo thành công',
            metadata: result,
        });
    }

    // Lấy số lượng thông báo chưa đọc
    async getUnreadCount(req, res) {
        const result = await notificationService.getUnreadCount(req.user.id);
        return res.status(200).json({
            success: true,
            message: 'Lấy số lượng thông báo chưa đọc thành công',
            metadata: result,
        });
    }

    // Đánh dấu 1 thông báo là đã đọc
    async markAsRead(req, res) {
        const result = await notificationService.markAsRead(req.params.id, req.user.id);
        return res.status(200).json({
            success: true,
            message: 'Đã đánh dấu thông báo là đã đọc',
            metadata: result,
        });
    }

    // Đánh dấu tất cả là đã đọc
    async markAllAsRead(req, res) {
        const result = await notificationService.markAllAsRead(req.user.id);
        return res.status(200).json({
            success: true,
            message: 'Đã đánh dấu tất cả thông báo là đã đọc',
            metadata: result,
        });
    }

    // Xóa 1 thông báo
    async deleteNotification(req, res) {
        const result = await notificationService.deleteNotification(req.params.id, req.user.id);
        return res.status(200).json({
            success: true,
            message: 'Đã xóa thông báo',
            metadata: result,
        });
    }

    // Gửi thông báo thử nghiệm (Dành cho Dev / Test)
    async sendTestNotification(req, res) {
        const { title, message, type, category, link, targetUserId, sendToAdmin, broadcastAll } = req.body;
        const result = await notificationService.createNotification({
            userId: targetUserId || req.user.id,
            title: title || 'Thông báo thử nghiệm từ Thư viện',
            message: message || 'Đây là nội dung thông báo thời gian thực được phát qua Socket.IO!',
            type: type || 'info',
            category: category || 'system',
            link: link || '/notifications',
            sendToAdmin: Boolean(sendToAdmin),
            broadcastAll: Boolean(broadcastAll),
        });

        return res.status(201).json({
            success: true,
            message: 'Đã phát thông báo Socket.IO thử nghiệm thành công!',
            metadata: result,
        });
    }
}

module.exports = new NotificationController();
