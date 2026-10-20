const { RentalOrder, RentalItem, Book, BookCopy, RentalPolicy, User } = require('../models');
const { Op } = require('sequelize');
const { BadRequestError, NotFoundError } = require('../core/error.response');
const rentalPolicyService = require('./rentalPolicy.service');
const notificationService = require('./notification.service');
const { processOverdueAndReminders } = require('../jobs/overdue.job');

class RentalService {
    // Create Online Borrow Request (Bạn đọc đặt mượn sách online)
    async createBorrowOrder(userId, data) {
        const { items = [], borrowType = 'home', pickupDate, dueDate, note, customerName, phone, email } = data;

        if (!items || items.length === 0) {
            throw new BadRequestError('Giỏ mượn sách đang trống!');
        }

        // 1. Fetch User info (card status is stored directly on User model)
        const user = (userId && userId !== 'user-guest') ? await User.findByPk(userId) : null;

        const cardTypeKey = user?.userType || 'student';
        const policy = await rentalPolicyService.getPolicyById(cardTypeKey);

        // 2. Validate Card Status if user exists
        if (user && user.cardStatus && user.cardStatus !== 'active' && user.role !== 'admin') {
            throw new BadRequestError(`Thẻ thư viện của bạn đang ở trạng thái "${user.cardStatus}". Vui lòng liên hệ thủ thư!`);
        }

        // 3. Validate Borrow Type vs Policy
        if (borrowType === 'home' && !policy.allowHomeBorrow) {
            throw new BadRequestError(`Loại thẻ "${policy.cardTypeName}" không được phép mượn sách về nhà!`);
        }
        if (borrowType === 'room' && !policy.allowRoomRead) {
            throw new BadRequestError(`Loại thẻ "${policy.cardTypeName}" không được phép đọc tại phòng đọc!`);
        }

        // 4. Validate Max Borrow Limit
        if (user) {
            const activeOrders = await RentalOrder.findAll({
                where: { userId: user.id, status: ['Pending', 'Approved', 'Rented', 'Overdue'] },
                include: [{ model: RentalItem, as: 'items' }],
            });

            let currentBorrowedCount = 0;
            activeOrders.forEach(ord => {
                currentBorrowedCount += ord.items ? ord.items.length : 0;
            });

            if (currentBorrowedCount + items.length > policy.maxBorrowBooks) {
                throw new BadRequestError(
                    `Bạn đã quá hạn mức mượn! Hạn mức tối đa của ${policy.cardTypeName} là ${policy.maxBorrowBooks} cuốn (bạn đang giữ ${currentBorrowedCount} cuốn).`
                );
            }
        }

        // 5. Calculate Dates
        const today = new Date();
        const pickDateStr = pickupDate || today.toISOString().split('T')[0];
        
        let dueDateStr = dueDate;
        if (!dueDateStr) {
            const dueObj = new Date(today);
            dueObj.setDate(dueObj.getDate() + (policy.maxBorrowDays || 14));
            dueDateStr = dueObj.toISOString().split('T')[0];
        }

        const pickD = new Date(pickDateStr);
        const dueD = new Date(dueDateStr);
        const diffTime = Math.max(1, Math.ceil((dueD - pickD) / (1000 * 60 * 60 * 24)));

        // 6. Generate Unique Order Code
        const countAll = await RentalOrder.count();
        const orderCode = `PM-${today.getFullYear()}-${(countAll + 1).toString().padStart(4, '0')}`;

        // 7. Calculate Rental & Deposit Totals per item
        let rentTotal = 0;
        let depositTotal = 0;
        const itemRecords = [];

        for (const item of items) {
            const book = await Book.findByPk(item.bookId);
            itemRecords.push({
                bookId: item.bookId,
                bookTitle: book ? book.title : item.title || 'Sách mượn',
                bookCover: book ? (book.coverImage || book.cover) : (item.cover || ''),
                copyId: null,
                dkcbCode: null,
                durationDays: diffTime,
                rentFee: 0,
                depositFee: 0,
                rentDate: pickDateStr,
                dueDate: dueDateStr,
                returnDate: null,
                daysRemaining: diffTime,
                progressPercent: 0,
                status: 'Pending',
                overdueDays: 0,
                penaltyFee: 0,
            });
        }

        const grandTotal = 0;

        // 8. Create RentalOrder (Free physical borrowing for library card holders)
        const newOrder = await RentalOrder.create({
            orderCode,
            userId: user ? user.id : null,
            customerName: customerName || user?.fullName || 'Bạn đọc',
            phone: phone || user?.phone || '0900000000',
            email: email || user?.email || '',
            borrowType,
            deliveryMethod: borrowType === 'home' ? 'library' : 'room',
            pickupDate: pickDateStr,
            dueDate: dueDateStr,
            status: 'Pending',
            note: note || '',
            rentTotal: 0,
            depositTotal: 0,
            grandTotal: 0,
        });

        // 9. Assign orderId and Bulk Create Items
        itemRecords.forEach(rec => { rec.orderId = newOrder.id; });
        await RentalItem.bulkCreate(itemRecords);

        // Alert Admin
        await notificationService.createNotification({
            title: 'Phiếu mượn sách trực tuyến mới',
            message: `Bạn đọc ${newOrder.customerName} vừa tạo phiếu mượn ${itemRecords.length} cuốn sách (Mã: ${orderCode}).`,
            type: 'info',
            category: 'rental',
            link: '/admin/rentals',
            sendToAdmin: true,
        });

        return await RentalOrder.findByPk(newOrder.id, {
            include: [{ model: RentalItem, as: 'items' }],
        });
    }

    // Get My Rental Orders History (Lịch sử mượn trả phía bạn đọc)
    async getMyRentalOrders(userId, statusFilter) {
        await processOverdueAndReminders();
        const where = {};
        if (userId && userId !== 'user-guest') {
            where.userId = userId;
        }
        if (statusFilter && statusFilter !== 'all') {
            where.status = statusFilter;
        }

        return await RentalOrder.findAll({
            where,
            order: [['createdAt', 'DESC']],
            include: [{ model: RentalItem, as: 'items' }],
        });
    }

    // Request Extension (Bạn đọc yêu cầu gia hạn sách)
    async requestExtension(orderId, userId) {
        const order = await RentalOrder.findOne({
            where: {
                [Op.or]: [{ id: orderId }, { orderCode: orderId }]
            },
            include: [{ model: RentalItem, as: 'items' }],
        });

        if (!order) throw new NotFoundError('Không tìm thấy phiếu mượn sách!');

        if (order.status !== 'Rented' && order.status !== 'Approved' && order.status !== 'Pending') {
            throw new BadRequestError('Chỉ được gia hạn khi phiếu mượn ở trạng thái Mượn hoặc Đang xử lý!');
        }

        const effectiveUserId = userId || order.userId;
        const user = effectiveUserId ? await User.findByPk(effectiveUserId) : null;
        const policy = await rentalPolicyService.getPolicyById(user?.userType || 'student');

        if (order.extensionsCount >= policy.maxExtensions) {
            throw new BadRequestError(`Bạn đã đạt giới hạn gia hạn tối đa (${policy.maxExtensions} lần)!`);
        }

        // Extend due date
        const currentDue = new Date(order.dueDate || Date.now());
        currentDue.setDate(currentDue.getDate() + (policy.extensionDays || 7));
        const newDueDateStr = currentDue.toISOString().split('T')[0];

        order.dueDate = newDueDateStr;
        order.extensionsCount += 1;
        await order.save();

        // Update items due date
        if (order.items) {
            for (const item of order.items) {
                item.dueDate = newDueDateStr;
                await item.save();
            }
        }

        // Push real-time notification to user
        if (order.userId && order.userId !== 'user-guest') {
            await notificationService.createNotification({
                userId: order.userId,
                title: 'Gia Hạn Mượn Sách Thành Công!',
                message: `Phiếu mượn ${order.orderCode} đã được gia hạn thành công. Ngày hết hạn mới là: ${newDueDateStr}.`,
                type: 'success',
                category: 'extension',
                link: '/my-rentals',
            });
        }

        return order;
    }

    // Cancel Pending Borrow Request (Refund deposit & rent fee to user wallet)
    async cancelBorrowOrder(orderId, userId) {
        const order = await RentalOrder.findOne({
            where: {
                [Op.or]: [{ id: orderId }, { orderCode: orderId }]
            }
        });
        if (!order) throw new NotFoundError('Không tìm thấy phiếu mượn!');

        if (order.status !== 'Pending' && order.status !== 'Approved') {
            throw new BadRequestError('Chỉ có thể hủy phiếu mượn khi đang ở trạng thái Chờ duyệt hoặc Đã duyệt chờ lấy!');
        }

        // Refund total paid back to user wallet
        const targetUserId = order.userId || userId;
        if (targetUserId && targetUserId !== 'user-guest') {
            const user = await User.findByPk(targetUserId);
            if (user) {
                user.walletBalance = (Number(user.walletBalance) || 0) + (Number(order.grandTotal) || 0);
                await user.save();
            }
        }

        order.status = 'Cancelled';
        await order.save();
        return order;
    }

    // ADMIN: Get all rental orders with filters & search
    async getAllRentalOrdersAdmin({ status, search }) {
        await processOverdueAndReminders();
        const where = {};

        if (status && status !== 'all') {
            where.status = status;
        }

        if (search) {
            where[Op.or] = [
                { orderCode: { [Op.like]: `%${search}%` } },
                { customerName: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } },
            ];
        }

        return await RentalOrder.findAll({
            where,
            order: [['createdAt', 'DESC']],
            include: [
                { model: RentalItem, as: 'items' },
                { model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'phone', 'memberCode', 'cardStatus'] }
            ],
        });
    }

    // ADMIN: Approve online borrow order & assign physical copy DKCB codes
    async approveBorrowOrderAdmin(orderId, { itemsMapping = [] }) {
        const order = await RentalOrder.findByPk(orderId, {
            include: [{ model: RentalItem, as: 'items' }],
        });

        if (!order) throw new NotFoundError('Không tìm thấy phiếu mượn!');
        if (order.status !== 'Pending') {
            throw new BadRequestError('Chỉ có thể phê duyệt phiếu mượn ở trạng thái Chờ duyệt!');
        }

        if (Array.isArray(itemsMapping) && itemsMapping.length > 0) {
            for (const mapItem of itemsMapping) {
                const targetItem = order.items.find(i => i.id === mapItem.itemId || i.bookId === mapItem.bookId);
                if (targetItem && mapItem.dkcbCode) {
                    targetItem.dkcbCode = mapItem.dkcbCode;
                    targetItem.copyId = mapItem.copyId || mapItem.dkcbCode;
                    await targetItem.save();

                    let copy = await BookCopy.findOne({ where: { dkcbCode: mapItem.dkcbCode } });
                    if (copy) {
                        copy.status = 'Rented';
                        copy.statusText = 'Đang được thuê';
                        copy.rentedTo = order.customerName || order.userId;
                        copy.dueDate = order.dueDate;
                        await copy.save();
                    } else {
                        // If not found in BookCopy, create it
                        await BookCopy.create({
                            copyId: `CP-${mapItem.bookId || 'bk'}-${Date.now().toString().slice(-4)}`,
                            dkcbCode: mapItem.dkcbCode,
                            bookId: mapItem.bookId,
                            status: 'Rented',
                            statusText: 'Đang được thuê',
                            rentedTo: order.customerName || order.userId,
                            dueDate: order.dueDate,
                            physicalCondition: 'good',
                            conditionText: 'Rất tốt (95%)',
                            location: 'Kho Tổng Hợp',
                        });
                    }
                }
            }
        }

        order.status = 'Approved';
        await order.save();

        // Push real-time notification to user
        if (order.userId && order.userId !== 'user-guest') {
            await notificationService.createNotification({
                userId: order.userId,
                title: 'Phiếu Mượn Sách Đã Được Phê Duyệt!',
                message: `Phiếu mượn ${order.orderCode} (${order.items ? order.items.length : 1} cuốn) đã được thủ thư duyệt và gán mã ĐKCB. Vui lòng đến quầy nhận sách trước ${order.pickupDate || 'ngày hẹn'}.`,
                type: 'success',
                category: 'rental',
                link: '/my-rentals',
            });
        }

        // Send Transactional Email
        const targetEmail = order.email || (order.userId ? (await User.findByPk(order.userId))?.email : null);
        if (targetEmail) {
            const emailService = require('./email.service');
            emailService.sendBorrowApprovalEmail(targetEmail, {
                fullName: order.customerName || 'Bạn đọc',
                orderCode: order.orderCode,
                pickupDate: order.pickupDate || 'Hôm nay',
                dueDate: order.dueDate || '',
                items: order.items || [],
                borrowType: order.borrowType || 'home',
            }).catch(err => console.warn('Borrow approval email error:', err.message));
        }

        return await RentalOrder.findByPk(orderId, {
            include: [{ model: RentalItem, as: 'items' }],
        });
    }

    // ADMIN: Reject online borrow order with reason & refund user wallet
    async rejectBorrowOrderAdmin(orderId, { rejectionReason }) {
        const order = await RentalOrder.findByPk(orderId);
        if (!order) throw new NotFoundError('Không tìm thấy phiếu mượn!');

        // Refund total paid back to user wallet
        if (order.userId && order.userId !== 'user-guest') {
            const user = await User.findByPk(order.userId);
            if (user) {
                user.walletBalance = (Number(user.walletBalance) || 0) + (Number(order.grandTotal) || 0);
                await user.save();
            }
        }

        order.status = 'Rejected';
        order.rejectionReason = rejectionReason || 'Số lượng sách trong kho không đủ hoặc hồ sơ bạn đọc cần bổ sung';
        await order.save();

        // Push real-time notification to user
        if (order.userId && order.userId !== 'user-guest') {
            await notificationService.createNotification({
                userId: order.userId,
                title: 'Yêu Cầu Mượn Sách Bị Từ Chối',
                message: `Phiếu mượn ${order.orderCode} chưa được duyệt. Lý do: ${order.rejectionReason}`,
                type: 'error',
                category: 'rental',
                link: '/my-rentals',
            });
        }

        return order;
    }

    // ADMIN: Confirm handover books to reader (Approved -> Rented)
    async confirmHandoverAdmin(orderId) {
        const order = await RentalOrder.findByPk(orderId, {
            include: [{ model: RentalItem, as: 'items' }],
        });
        if (!order) throw new NotFoundError('Không tìm thấy phiếu mượn!');

        if (order.status !== 'Approved') {
            throw new BadRequestError('Chỉ có thể giao sách cho phiếu đã được duyệt!');
        }

        order.status = 'Rented';
        await order.save();

        if (order.items) {
            for (const item of order.items) {
                item.status = 'Active';
                await item.save();
            }
        }

        return order;
    }

    // ADMIN: Process book return, refund deposit (minus fine), & restore inventory copies
    async processReturnAdmin(orderId, { fineAmount = 0, note = '' }) {
        const order = await RentalOrder.findByPk(orderId, {
            include: [{ model: RentalItem, as: 'items' }],
        });
        if (!order) throw new NotFoundError('Không tìm thấy phiếu mượn!');

        const todayStr = new Date().toISOString().split('T')[0];
        const resolvedFine = (fineAmount === undefined || fineAmount === null || fineAmount === '')
            ? (Number(order.fineAmount) || 0)
            : Number(fineAmount) || 0;
        order.status = 'Returned';
        order.returnDate = todayStr;
        order.fineAmount = resolvedFine;
        if (note) order.note = (order.note ? `${order.note} | ` : '') + note;
        await order.save();

        // Refund depositTotal minus fineAmount back to user's wallet
        if (order.userId && order.userId !== 'user-guest') {
            const user = await User.findByPk(order.userId);
            if (user) {
                const refundAmount = Math.max(0, (Number(order.depositTotal) || 0) - resolvedFine);
                user.walletBalance = (Number(user.walletBalance) || 0) + refundAmount;
                await user.save();
            }
        }

        if (order.items) {
            for (const item of order.items) {
                item.status = 'Returned';
                item.returnDate = todayStr;
                await item.save();

                if (item.dkcbCode) {
                    const copy = await BookCopy.findOne({ where: { dkcbCode: item.dkcbCode } });
                    if (copy) {
                        copy.status = 'Available';
                        copy.statusText = 'Có sẵn trong kho';
                        copy.rentedTo = null;
                        copy.dueDate = null;
                        await copy.save();
                    }
                }
            }
        }

        // Push real-time notification to user
        if (order.userId && order.userId !== 'user-guest') {
            const hasFine = resolvedFine > 0;
            await notificationService.createNotification({
                userId: order.userId,
                title: hasFine ? 'Xác Nhận Trả Sách (Có Phí Phạt)' : 'Xác Nhận Trả Sách Thành Công',
                message: hasFine
                    ? `Phiếu mượn ${order.orderCode} đã hoàn tất trả sách. Phí phạt phát sinh: ${resolvedFine.toLocaleString('vi-VN')} đ.`
                    : `Phiếu mượn ${order.orderCode} đã hoàn tất trả sách. Cảm ơn bạn đọc đã bảo quản tốt tài liệu thư viện!`,
                type: hasFine ? 'warning' : 'success',
                category: 'rental',
                link: '/my-rentals',
            });
        }

        return order;
    }

    // ADMIN: Create Direct Counter Borrow Order (Mượn trực tiếp tại quầy)
    async createOrderAtCounterAdmin(payload) {
        const { userId, customerName, phone, email, borrowType, pickupDate, dueDate, items, note, paymentMethod = 'cash' } = payload;

        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new BadRequestError('Phiếu mượn phải chứa ít nhất 1 đầu sách!');
        }

        const user = userId && userId !== 'user-guest' ? await User.findByPk(userId) : null;
        const policy = await rentalPolicyService.getPolicyById(user?.userType || 'student');

        const today = new Date();
        const pickDateStr = pickupDate || today.toISOString().split('T')[0];
        let dueDateStr = dueDate;
        if (!dueDateStr) {
            const dueObj = new Date(today);
            dueObj.setDate(dueObj.getDate() + (policy.maxBorrowDays || 14));
            dueDateStr = dueObj.toISOString().split('T')[0];
        }

        const pickD = new Date(pickDateStr);
        const dueD = new Date(dueDateStr);
        const diffTime = Math.max(1, Math.ceil((dueD - pickD) / (1000 * 60 * 60 * 24)));

        const countAll = await RentalOrder.count();
        const orderCode = `PM-${today.getFullYear()}-${(countAll + 1).toString().padStart(4, '0')}`;

        let rentTotal = 0;
        let depositTotal = 0;
        const itemRecords = [];

        for (const item of items) {
            const book = await Book.findByPk(item.bookId);
            const depFee = item.deposit || book?.deposit || 50000;

            let dailyRate = policy.dailyRateTier1 || 5000;
            if (diffTime >= 31) dailyRate = policy.dailyRateTier4 || 1500;
            else if (diffTime >= 15) dailyRate = policy.dailyRateTier3 || 2000;
            else if (diffTime >= 8) dailyRate = policy.dailyRateTier2 || 3000;

            const itemRentFee = dailyRate * diffTime;
            rentTotal += itemRentFee;
            depositTotal += depFee;

            itemRecords.push({
                bookId: item.bookId,
                bookTitle: book ? book.title : item.title || 'Sách mượn',
                bookCover: book ? (book.coverImage || book.cover) : (item.cover || ''),
                copyId: item.copyId || item.dkcbCode || null,
                dkcbCode: item.dkcbCode || null,
                durationDays: diffTime,
                rentFee: 0,
                depositFee: 0,
                rentDate: pickDateStr,
                dueDate: dueDateStr,
                returnDate: null,
                daysRemaining: diffTime,
                progressPercent: 0,
                status: 'Active',
                overdueDays: 0,
                penaltyFee: 0,
            });

            if (item.dkcbCode) {
                const copy = await BookCopy.findOne({ where: { dkcbCode: item.dkcbCode } });
                if (copy) {
                    copy.status = 'Rented';
                    copy.statusText = 'Đang được thuê';
                    copy.rentedTo = customerName || user?.fullName || 'Bạn đọc';
                    copy.dueDate = dueDateStr;
                    await copy.save();
                }
            }
        }

        const grandTotal = 0;

        const newOrder = await RentalOrder.create({
            orderCode,
            userId: user ? user.id : null,
            customerName: customerName || user?.fullName || 'Bạn đọc tại quầy',
            phone: phone || user?.phone || '0900000000',
            email: email || user?.email || '',
            borrowType: borrowType || 'home',
            deliveryMethod: 'library',
            paymentMethod: 'free',
            pickupDate: pickDateStr,
            dueDate: dueDateStr,
            status: 'Rented',
            note: note || 'Lập phiếu mượn trực tiếp tại quầy thủ thư',
            rentTotal: 0,
            depositTotal: 0,
            grandTotal: 0,
        });

        itemRecords.forEach(rec => { rec.orderId = newOrder.id; });
        await RentalItem.bulkCreate(itemRecords);

        return await RentalOrder.findByPk(newOrder.id, {
            include: [{ model: RentalItem, as: 'items' }],
        });
    }
}

module.exports = new RentalService();
