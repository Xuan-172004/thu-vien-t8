const rentalService = require('../services/rental.service');
const { SuccessResponse } = require('../core/success.response');

class RentalController {
    async createBorrowOrder(req, res) {
        const userId = req.user?.id || req.body.userId || 'user-guest';
        const result = await rentalService.createBorrowOrder(userId, req.body);
        new SuccessResponse({
            message: 'Đăng ký đặt mượn sách thành công! Yêu cầu của bạn đang chờ thủ thư phê duyệt.',
            metadata: result,
        }).send(res);
    }

    async getMyRentalOrders(req, res) {
        const userId = req.user?.id || req.query.userId || 'user-guest';
        const { status } = req.query;
        const result = await rentalService.getMyRentalOrders(userId, status);
        new SuccessResponse({
            message: 'Lấy danh sách phiếu mượn sách thành công',
            metadata: result,
        }).send(res);
    }

    async requestExtension(req, res) {
        const { id } = req.params;
        const userId = req.user?.id || req.body?.userId;
        const result = await rentalService.requestExtension(id, userId);
        new SuccessResponse({
            message: 'Đã gia hạn mượn sách thành công!',
            metadata: result,
        }).send(res);
    }

    async cancelBorrowOrder(req, res) {
        const { id } = req.params;
        const userId = req.user?.id || req.body?.userId;
        const result = await rentalService.cancelBorrowOrder(id, userId);
        new SuccessResponse({
            message: 'Đã hủy yêu cầu mượn sách & hoàn tiền cọc vào ví thành công!',
            metadata: result,
        }).send(res);
    }

    // ADMIN HANDLERS
    async getAllRentalOrdersAdmin(req, res) {
        const { status, search } = req.query;
        const result = await rentalService.getAllRentalOrdersAdmin({ status, search });
        new SuccessResponse({
            message: 'Lấy danh sách quản lý mượn trả thành công',
            metadata: result,
        }).send(res);
    }

    async approveBorrowOrderAdmin(req, res) {
        const { id } = req.params;
        const result = await rentalService.approveBorrowOrderAdmin(id, req.body);
        new SuccessResponse({
            message: 'Phê duyệt phiếu mượn sách thành công!',
            metadata: result,
        }).send(res);
    }

    async rejectBorrowOrderAdmin(req, res) {
        const { id } = req.params;
        const result = await rentalService.rejectBorrowOrderAdmin(id, req.body);
        new SuccessResponse({
            message: 'Đã từ chối phiếu mượn sách!',
            metadata: result,
        }).send(res);
    }

    async confirmHandoverAdmin(req, res) {
        const { id } = req.params;
        const result = await rentalService.confirmHandoverAdmin(id);
        new SuccessResponse({
            message: 'Xác nhận giao sách cho bạn đọc thành công!',
            metadata: result,
        }).send(res);
    }

    async processReturnAdmin(req, res) {
        const { id } = req.params;
        const result = await rentalService.processReturnAdmin(id, req.body);
        new SuccessResponse({
            message: 'Tiếp nhận trả sách & hoàn kho thành công!',
            metadata: result,
        }).send(res);
    }

    async createOrderAtCounterAdmin(req, res) {
        const result = await rentalService.createOrderAtCounterAdmin(req.body);
        new SuccessResponse({
            message: 'Lập phiếu mượn trực tiếp tại quầy thành công!',
            metadata: result,
        }).send(res);
    }
}

module.exports = new RentalController();
