const rentalPolicyService = require('../services/rentalPolicy.service');
const { SuccessResponse } = require('../core/success.response');

class RentalPolicyController {
    async getAllPolicies(req, res) {
        new SuccessResponse({
            message: 'Lấy danh sách cấu hình chính sách thành công',
            metadata: await rentalPolicyService.getAllPolicies(),
        }).send(res);
    }

    async getPolicyById(req, res) {
        new SuccessResponse({
            message: 'Lấy chi tiết chính sách thành công',
            metadata: await rentalPolicyService.getPolicyById(req.params.id),
        }).send(res);
    }

    async updatePolicy(req, res) {
        new SuccessResponse({
            message: 'Cập nhật cấu hình chính sách mượn & phạt thành công',
            metadata: await rentalPolicyService.updatePolicy(req.params.id, req.body),
        }).send(res);
    }
}

module.exports = new RentalPolicyController();
