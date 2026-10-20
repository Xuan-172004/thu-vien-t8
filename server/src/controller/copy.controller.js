const copyService = require('../services/copy.service');

class CopyController {
    async getAllCopies(req, res) {
        const result = await copyService.getAllCopies(req.query);
        return res.status(200).json({ success: true, metadata: result });
    }

    async batchCreateCopies(req, res) {
        const result = await copyService.batchCreateCopies(req.body);
        return res.status(201).json({ success: true, message: 'Cấp mã ĐKCB hàng loạt thành công', metadata: result });
    }

    async transferCopy(req, res) {
        const result = await copyService.transferCopy(req.params.id, req.body);
        return res.status(200).json({ success: true, message: 'Điều chuyển vị trí sách thành công', metadata: result });
    }

    async updateCondition(req, res) {
        const result = await copyService.updateCondition(req.params.id, req.body);
        return res.status(200).json({ success: true, message: 'Cập nhật tình trạng vật lý thành công', metadata: result });
    }

    async deleteCopy(req, res) {
        const result = await copyService.deleteCopy(req.params.id);
        return res.status(200).json({ success: true, message: 'Đã xóa bản sao sách thành công', metadata: result });
    }

    // Warehouse & Shelves Handlers
    async getAllWarehouses(req, res) {
        const result = await copyService.getAllWarehouses();
        return res.status(200).json({ success: true, metadata: result });
    }

    async createWarehouse(req, res) {
        const result = await copyService.createWarehouse(req.body);
        return res.status(201).json({ success: true, message: 'Tạo kho sách mới thành công', metadata: result });
    }

    async updateWarehouse(req, res) {
        const result = await copyService.updateWarehouse(req.params.id, req.body);
        return res.status(200).json({ success: true, message: 'Cập nhật kho sách thành công', metadata: result });
    }

    async deleteWarehouse(req, res) {
        const result = await copyService.deleteWarehouse(req.params.id);
        return res.status(200).json({ success: true, message: 'Đã xóa kho sách', metadata: result });
    }

    async getAllShelves(req, res) {
        const result = await copyService.getAllShelves(req.query.warehouseId);
        return res.status(200).json({ success: true, metadata: result });
    }

    async createShelf(req, res) {
        const result = await copyService.createShelf(req.body);
        return res.status(201).json({ success: true, message: 'Tạo tủ/kệ sách mới thành công', metadata: result });
    }

    async updateShelf(req, res) {
        const result = await copyService.updateShelf(req.params.id, req.body);
        return res.status(200).json({ success: true, message: 'Cập nhật tủ/kệ sách thành công', metadata: result });
    }

    async deleteShelf(req, res) {
        const result = await copyService.deleteShelf(req.params.id);
        return res.status(200).json({ success: true, message: 'Đã xóa tủ/kệ sách', metadata: result });
    }
}

module.exports = new CopyController();
