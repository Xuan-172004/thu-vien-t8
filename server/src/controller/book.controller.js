const bookService = require('../services/book.service');

class BookController {
    async getAllBooks(req, res) {
        const result = await bookService.getAllBooks(req.query);
        return res.status(200).json({ success: true, metadata: result });
    }

    async getAllBooksAdmin(req, res) {
        const result = await bookService.getAllBooksAdmin(req.query);
        return res.status(200).json({ success: true, metadata: result });
    }

    async getBookById(req, res) {
        const result = await bookService.getBookById(req.params.id);
        return res.status(200).json({ success: true, metadata: result });
    }

    async createBook(req, res) {
        const result = await bookService.createBook(req.body);
        return res.status(201).json({ success: true, message: 'Tạo đầu sách thành công', metadata: result });
    }

    async updateBook(req, res) {
        const result = await bookService.updateBook(req.params.id, req.body);
        return res.status(200).json({ success: true, message: 'Cập nhật đầu sách thành công', metadata: result });
    }

    async deleteBook(req, res) {
        const result = await bookService.deleteBook(req.params.id);
        return res.status(200).json({ success: true, message: 'Đã xóa đầu sách thành công', metadata: result });
    }

    async toggleVisibilityBook(req, res) {
        const result = await bookService.toggleVisibilityBook(req.params.id);
        return res.status(200).json({ success: true, message: 'Đã cập nhật trạng thái ẩn/hiện sách', metadata: result });
    }

    async getCategories(req, res) {
        const result = await bookService.getCategories();
        return res.status(200).json({ success: true, metadata: result });
    }

    async createCategory(req, res) {
        const result = await bookService.createCategory(req.body);
        return res.status(201).json({ success: true, message: 'Tạo thể loại thành công', metadata: result });
    }

    async updateCategory(req, res) {
        const result = await bookService.updateCategory(req.params.id, req.body);
        return res.status(200).json({ success: true, message: 'Cập nhật thể loại thành công', metadata: result });
    }

    async deleteCategory(req, res) {
        const result = await bookService.deleteCategory(req.params.id);
        return res.status(200).json({ success: true, message: 'Đã xóa thể loại thành công', metadata: result });
    }

    async addBookCopy(req, res) {
        const { bookId, copyCode } = req.body;
        const result = await bookService.addBookCopy(bookId, copyCode);
        return res.status(201).json({ success: true, message: 'Thêm bản sách thành công', metadata: result });
    }

    async updateCopyStatus(req, res) {
        const { copyId, status } = req.body;
        const result = await bookService.updateCopyStatus(copyId, status);
        return res.status(200).json({ success: true, message: 'Cập nhật trạng thái bản sách thành công', metadata: result });
    }

    async seedLibraryData(req, res) {
        const { seedDatabase } = require('../scripts/seedFullLibraryData');
        await seedDatabase();
        return res.status(200).json({ success: true, message: 'Đã tạo mới toàn bộ dữ liệu mẫu thư viện thành công (8 chuyên mục, 80 sách, 320 bản sao, 17 tài liệu số/đồ án)' });
    }
}

module.exports = new BookController();
