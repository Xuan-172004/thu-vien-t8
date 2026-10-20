const DigitalDocumentService = require('../services/digitalDocument.service');

class DigitalDocumentController {
    static async getAllAdmin(req, res, next) {
        try {
            const { search, category, documentType, status, page, limit } = req.query;
            const result = await DigitalDocumentService.getAllAdmin({
                search,
                category,
                documentType,
                status,
                page,
                limit,
            });
            return res.status(200).json({
                status: 'success',
                message: 'Lấy danh sách tài liệu số thành công',
                metadata: result,
            });
        } catch (error) {
            next(error);
        }
    }

    static async createAdmin(req, res, next) {
        try {
            const doc = await DigitalDocumentService.createAdmin(req.body);
            return res.status(201).json({
                status: 'success',
                message: 'Thêm tài liệu số thành công',
                metadata: doc,
            });
        } catch (error) {
            next(error);
        }
    }

    static async updateAdmin(req, res, next) {
        try {
            const { id } = req.params;
            const doc = await DigitalDocumentService.updateAdmin(id, req.body);
            return res.status(200).json({
                status: 'success',
                message: 'Cập nhật tài liệu số thành công',
                metadata: doc,
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteAdmin(req, res, next) {
        try {
            const { id } = req.params;
            await DigitalDocumentService.deleteAdmin(id);
            return res.status(200).json({
                status: 'success',
                message: 'Xóa tài liệu số thành công',
            });
        } catch (error) {
            next(error);
        }
    }

    static async toggleStatusAdmin(req, res, next) {
        try {
            const { id } = req.params;
            const doc = await DigitalDocumentService.toggleStatusAdmin(id);
            return res.status(200).json({
                status: 'success',
                message: `Đã ${doc.status === 'active' ? 'bật hiển thị' : 'ẩn'} tài liệu số`,
                metadata: doc,
            });
        } catch (error) {
            next(error);
        }
    }

    static async uploadFile(req, res, next) {
        try {
            if (!req.file) {
                return res.status(400).json({ status: 'error', message: 'Vui lòng chọn file upload!' });
            }
            const protocol = req.protocol;
            const host = req.get('host');
            const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
            const sizeMB = `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`;

            return res.status(200).json({
                status: 'success',
                message: 'Upload file thành công',
                metadata: {
                    url: fileUrl,
                    filename: req.file.originalname,
                    storedFilename: req.file.filename,
                    size: sizeMB,
                },
            });
        } catch (error) {
            next(error);
        }
    }

    static async getAllPublic(req, res, next) {
        try {
            const { search, category, documentType, page, limit } = req.query;
            const result = await DigitalDocumentService.getAllPublic({
                search,
                category,
                documentType,
                page,
                limit,
            });
            return res.status(200).json({
                status: 'success',
                message: 'Lấy danh sách tài liệu số thành công',
                metadata: result,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getDetailPublic(req, res, next) {
        try {
            const { id } = req.params;
            const doc = await DigitalDocumentService.getDetailPublic(id);
            return res.status(200).json({
                status: 'success',
                message: 'Lấy chi tiết tài liệu số thành công',
                metadata: doc,
            });
        } catch (error) {
            next(error);
        }
    }

    static async checkOwnership(req, res, next) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            const result = await DigitalDocumentService.checkOwnership(userId, id);
            return res.status(200).json({
                status: 'success',
                metadata: result,
            });
        } catch (error) {
            next(error);
        }
    }

    static async purchase(req, res, next) {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const { paymentMethod } = req.body;
            const result = await DigitalDocumentService.purchaseDigitalDoc(userId, id, paymentMethod);
            return res.status(200).json({
                status: 'success',
                message: result.message,
                metadata: result,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getMyPurchases(req, res, next) {
        try {
            const userId = req.user.id;
            const list = await DigitalDocumentService.getMyPurchasedDocs(userId);
            return res.status(200).json({
                status: 'success',
                metadata: list,
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = DigitalDocumentController;
