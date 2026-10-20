const { Op } = require('sequelize');
const { RentalOrder, RentalItem, BookCopy, User, Notification } = require('../models');
const rentalPolicyService = require('../services/rentalPolicy.service');
const notificationService = require('../services/notification.service');

let running = false;
let lastRunAt = 0;
const MIN_RUN_GAP_MS = 60 * 1000;
const JOB_INTERVAL_MS = 6 * 60 * 60 * 1000;

function todayStr() {
    return new Date().toISOString().slice(0, 10);
}

function startOfToday() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
}

function daysBetween(fromStr, toStr) {
    const from = new Date(`${fromStr}T00:00:00`);
    const to = new Date(`${toStr}T00:00:00`);
    return Math.floor((to - from) / (1000 * 60 * 60 * 24));
}

function policyIdFromUserType(userType) {
    if (userType === 'staff') return 'teacher';
    if (userType === 'guest') return 'guest';
    return 'student';
}

async function getPolicyForUser(user) {
    const policyId = policyIdFromUserType(user?.userType);
    try {
        return await rentalPolicyService.getPolicyById(policyId);
    } catch (err) {
        return await rentalPolicyService.getPolicyById('student');
    }
}

async function alreadyNotified(userId, category, orderId) {
    if (!userId) return false;
    const rows = await Notification.findAll({
        where: {
            userId,
            category,
            createdAt: { [Op.gte]: startOfToday() },
        },
        order: [['createdAt', 'DESC']],
        limit: 30,
    });
    return rows.some((n) => {
        const meta = n.metadata || {};
        return meta.orderId === orderId;
    });
}

async function processOverdueAndReminders({ force = false } = {}) {
    const now = Date.now();
    if (running) return { skipped: true };
    if (!force && now - lastRunAt < MIN_RUN_GAP_MS) return { skipped: true };

    running = true;
    lastRunAt = now;

    try {
        const today = todayStr();
        const activeOrders = await RentalOrder.findAll({
            where: { status: { [Op.in]: ['Rented', 'Overdue'] } },
            include: [
                { model: RentalItem, as: 'items' },
                { model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'userType', 'cardStatus'] },
            ],
        });

        let overdueCount = 0;
        let reminderCount = 0;

        for (const order of activeOrders) {
            if (!order.dueDate) continue;

            const overdueDays = daysBetween(order.dueDate, today);
            const user = order.user;
            const policy = await getPolicyForUser(user);
            const finePerDay = Number(policy.overdueFinePerDay) || 5000;

            if (order.status === 'Rented' && overdueDays === 0) {
                reminderCount += 1;
                if (user?.id && !(await alreadyNotified(user.id, 'due_reminder', order.id))) {
                    await notificationService.createNotification({
                        userId: user.id,
                        title: 'Sách đến hạn trả hôm nay',
                        message: `Phiếu ${order.orderCode} hết hạn ${order.dueDate}. Vui lòng trả sách trong ngày.`,
                        type: 'warning',
                        category: 'due_reminder',
                        link: '/my-rentals',
                        metadata: { orderId: order.id, orderCode: order.orderCode },
                    });
                }
            }

            if (overdueDays > 0) {
                const justBecameOverdue = order.status !== 'Overdue';
                let orderFine = 0;

                if (order.items) {
                    for (const item of order.items) {
                        if (item.status === 'Returned') continue;
                        item.status = 'Overdue';
                        item.overdueDays = overdueDays;
                        item.penaltyFee = overdueDays * finePerDay;
                        item.daysRemaining = 0;
                        await item.save();
                        orderFine += Number(item.penaltyFee) || 0;

                        if (item.dkcbCode) {
                            const copy = await BookCopy.findOne({ where: { dkcbCode: item.dkcbCode } });
                            if (copy && copy.status !== 'Available' && copy.status !== 'Maintenance') {
                                copy.status = 'Overdue';
                                copy.statusText = 'Quá hạn';
                                await copy.save();
                            }
                        }
                    }
                } else {
                    orderFine = overdueDays * finePerDay;
                }

                order.status = 'Overdue';
                order.fineAmount = orderFine;
                await order.save();

                if (user && Number(policy.autoLockDaysOverdue) > 0 && overdueDays >= Number(policy.autoLockDaysOverdue)) {
                    if (user.cardStatus === 'active') {
                        user.cardStatus = 'locked';
                        await user.save();
                    }
                }

                if (justBecameOverdue) {
                    overdueCount += 1;
                    if (user?.id && !(await alreadyNotified(user.id, 'overdue', order.id))) {
                        await notificationService.createNotification({
                            userId: user.id,
                            title: 'Sách mượn đã quá hạn',
                            message: `Phiếu ${order.orderCode} quá hạn ${overdueDays} ngày. Phí phạt: ${orderFine.toLocaleString('vi-VN')} đ.`,
                            type: 'error',
                            category: 'overdue',
                            link: '/my-rentals',
                            metadata: {
                                orderId: order.id,
                                orderCode: order.orderCode,
                                overdueDays,
                                fineAmount: orderFine,
                            },
                            sendToAdmin: true,
                        });
                    }
                }
            }
        }

        if (overdueCount || reminderCount) {
            console.log(`[OverdueJob] Quá hạn mới: ${overdueCount}, nhắc hạn: ${reminderCount}`);
        }
        return { overdueCount, reminderCount };
    } catch (err) {
        console.error('[OverdueJob] error:', err.message);
        return { error: err.message };
    } finally {
        running = false;
    }
}

function startOverdueJob() {
    processOverdueAndReminders({ force: true }).catch((err) =>
        console.error('[OverdueJob] first run error:', err.message),
    );
    setInterval(() => {
        processOverdueAndReminders({ force: true }).catch((err) =>
            console.error('[OverdueJob] interval error:', err.message),
        );
    }, JOB_INTERVAL_MS);
    console.log('⏰ Overdue job started (every 6 hours + on rental list fetch)');
}

module.exports = { processOverdueAndReminders, startOverdueJob };
