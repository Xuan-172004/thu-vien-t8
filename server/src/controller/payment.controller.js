const paymentService = require('../services/payment.service');
const { SuccessResponse } = require('../core/success.response');

class PaymentController {
    async createDeposit(req, res) {
        const userId = req.user?.id || req.body.userId;
        const { amount, paymentMethod } = req.body;
        const result = await paymentService.createDepositPayment(userId, amount, paymentMethod);
        new SuccessResponse({
            message: 'Tạo liên kết thanh toán nạp tiền thành công',
            metadata: result,
        }).send(res);
    }

    async vnpayCallback(req, res) {
        const redirectUrl = await paymentService.vnpayCallback(req.query);
        return res.redirect(redirectUrl);
    }

    async momoCallback(req, res) {
        const redirectUrl = await paymentService.momoCallback(req.query || req.body);
        return res.redirect(redirectUrl);
    }

    async getHistory(req, res) {
        const userId = req.user?.id || req.query.userId;
        const result = await paymentService.getDepositHistory(userId);
        new SuccessResponse({
            message: 'Lấy lịch sử nạp tiền thành công',
            metadata: result,
        }).send(res);
    }
}

module.exports = new PaymentController();
