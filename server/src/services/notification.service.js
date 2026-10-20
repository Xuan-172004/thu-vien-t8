const { Notification, User } = require('../models');
const { Op } = require('sequelize');
const { sendNotificationToUser, broadcastNotificationToAdmins, getIO } = require('../socket');

class NotificationService {
    /**
     * Tạo thông báo mới, lưu vào Database và phát Socket.IO thời gian thực
     */
    async createNotification({
        userId = null,
        title,
        message,
        type = 'info',
        category = 'system',
        link = null,
        metadata = null,
        sendToAdmin = false,
        broadcastAll = false,
    }) {
        try {
            const notif = await Notification.create({
                userId,
                title,
                message,
                type,
                category,
                link,
                metadata,
                isRead: false,
            });

            const payload = {
                id: notif.id,
                userId: notif.userId,
                title: notif.title,
                message: notif.message,
                type: notif.type,
                category: notif.category,
                link: notif.link,
                metadata: notif.metadata,
                isRead: notif.isRead,
                createdAt: notif.createdAt,
            };

            // Emit real-time WebSocket events
            if (userId) {
                sendNotificationToUser(userId, payload);
            }

            if (sendToAdmin) {
                broadcastNotificationToAdmins(payload);
            }

            if (broadcastAll) {
                const io = getIO();
                if (io) io.emit('notification', payload);
            }

            return notif;
        } catch (err) {
            console.error('❌ Error creating/pushing notification:', err);
            return null;
        }
    }

    /**
     * Lấy danh sách thông báo của người dùng kèm phân trang và lọc
     */
    async getUserNotifications(userId, queryParams = {}) {
        const { isRead, category, page = 1, limit = 20 } = queryParams;

        const where = {
            [Op.or]: [
                { userId },
                { userId: null }, // System broadcast notifications
            ],
        };

        if (isRead !== undefined && isRead !== 'all') {
            where.isRead = isRead === 'true' || isRead === true;
        }

        if (category && category !== 'all') {
            where.category = category;
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { rows, count } = await Notification.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        const unreadCount = await Notification.count({
            where: {
                [Op.or]: [{ userId }, { userId: null }],
                isRead: false,
            },
        });

        return {
            notifications: rows,
            totalItems: count,
            unreadCount,
            totalPages: Math.ceil(count / parseInt(limit)) || 1,
            currentPage: parseInt(page),
        };
    }

    /**
     * Lấy số lượng thông báo chưa đọc
     */
    async getUnreadCount(userId) {
        const count = await Notification.count({
            where: {
                [Op.or]: [{ userId }, { userId: null }],
                isRead: false,
            },
        });
        return { unreadCount: count };
    }

    /**
     * Đánh dấu 1 thông báo là đã đọc
     */
    async markAsRead(id, userId) {
        const notif = await Notification.findOne({
            where: {
                id,
                [Op.or]: [{ userId }, { userId: null }],
            },
        });

        if (notif) {
            await notif.update({ isRead: true });
        }
        return notif;
    }

    /**
     * Đánh dấu tất cả thông báo của người dùng là đã đọc
     */
    async markAllAsRead(userId) {
        await Notification.update(
            { isRead: true },
            {
                where: {
                    [Op.or]: [{ userId }, { userId: null }],
                    isRead: false,
                },
            }
        );
        return { success: true, message: 'Đã đánh dấu tất cả thông báo là đã đọc' };
    }

    /**
     * Xóa 1 thông báo
     */
    async deleteNotification(id, userId) {
        const notif = await Notification.findOne({
            where: {
                id,
                [Op.or]: [{ userId }, { userId: null }],
            },
        });

        if (notif) {
            await notif.destroy();
        }
        return { success: true, message: 'Đã xóa thông báo' };
    }
}

module.exports = new NotificationService();
