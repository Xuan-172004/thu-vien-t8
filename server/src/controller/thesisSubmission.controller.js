const thesisSubmissionService = require('../services/thesisSubmission.service');

class ThesisSubmissionController {
    // Sinh viên nộp đồ án
    async submit(req, res) {
        const result = await thesisSubmissionService.submitThesis(req.user.id, req.body);
        return res.status(201).json({
            success: true,
            message: 'Nộp hồ sơ đồ án / luận văn thành công! Hồ sơ đang chờ thủ thư phê duyệt.',
            metadata: result,
        });
    }

    // Sinh viên lấy danh sách đồ án đã nộp
    async getMySubmissions(req, res) {
        const result = await thesisSubmissionService.getMySubmissions(req.user.id);
        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách đồ án đã nộp thành công',
            metadata: result,
        });
    }

    // Sinh viên chỉnh sửa nộp lại hồ sơ bị từ chối
    async resubmit(req, res) {
        const result = await thesisSubmissionService.resubmitThesis(req.params.id, req.user.id, req.body);
        return res.status(200).json({
            success: true,
            message: 'Đã cập nhật và gửi lại hồ sơ phê duyệt thành công!',
            metadata: result,
        });
    }

    // Admin lấy toàn bộ hồ sơ nộp
    async getAllAdmin(req, res) {
        const result = await thesisSubmissionService.getAllSubmissionsAdmin(req.query);
        return res.status(200).json({
            success: true,
            message: 'Lấy danh sách hồ sơ nộp thành công',
            metadata: result,
        });
    }

    // Admin xem chi tiết 1 hồ sơ
    async getDetail(req, res) {
        const result = await thesisSubmissionService.getSubmissionDetail(req.params.id);
        return res.status(200).json({
            success: true,
            message: 'Lấy thông tin hồ sơ nộp thành công',
            metadata: result,
        });
    }

    // Admin phê duyệt hồ sơ & xuất bản lên kho số
    async approve(req, res) {
        const result = await thesisSubmissionService.approveSubmission(req.params.id, req.user, req.body);
        return res.status(200).json({
            success: true,
            message: `Phê duyệt và xuất bản đồ án thành công! Mã tài liệu số: ${result.publishedDocument.docCode}`,
            metadata: result,
        });
    }

    // Admin từ chối hồ sơ
    async reject(req, res) {
        const result = await thesisSubmissionService.rejectSubmission(req.params.id, req.user, req.body);
        return res.status(200).json({
            success: true,
            message: 'Đã gửi phản hồi yêu cầu chỉnh sửa / từ chối hồ sơ đến sinh viên.',
            metadata: result,
        });
    }

    // Upload file PDF / Cover đồ án nộp
    async uploadSubmissionFile(req, res) {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Vui lòng chọn file hợp lệ (PDF hoặc Hình ảnh)' });
        }
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        return res.status(200).json({
            success: true,
            message: 'Tải file lên thành công',
            metadata: {
                url: fileUrl,
                filename: req.file.filename,
                size: (req.file.size / (1024 * 1024)).toFixed(2) + ' MB',
            },
        });
    }
}

module.exports = new ThesisSubmissionController();
