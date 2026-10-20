const articleService = require('../services/article.service');
const { OK } = require('../core/success.response');

class ArticleController {
    /**
     * Lấy danh sách bài viết (Public & Admin)
     */
    async getAllArticles(req, res) {
        const { page, limit, category, status, search, featured, sort } = req.query;
        const result = await articleService.getAllArticles({
            page,
            limit,
            category,
            status,
            search,
            featured,
            sort,
        });

        return new OK({
            message: 'Lấy danh sách bài viết thành công!',
            metadata: result,
        }).send(res);
    }

    /**
     * Lấy chi tiết bài viết theo Slug hoặc ID
     */
    async getArticleDetail(req, res) {
        const { slugOrId } = req.params;
        const result = await articleService.getArticleBySlugOrId(slugOrId);

        return new OK({
            message: 'Lấy chi tiết bài viết thành công!',
            metadata: result,
        }).send(res);
    }

    /**
     * Tạo bài viết mới (Admin)
     */
    async createArticle(req, res) {
        const result = await articleService.createArticle(req.body, req.user);

        return new OK({
            message: 'Tạo bài viết mới thành công!',
            metadata: result,
        }).send(res);
    }

    /**
     * Cập nhật bài viết (Admin)
     */
    async updateArticle(req, res) {
        const { id } = req.params;
        const result = await articleService.updateArticle(id, req.body);

        return new OK({
            message: 'Cập nhật bài viết thành công!',
            metadata: result,
        }).send(res);
    }

    /**
     * Xóa bài viết (Admin)
     */
    async deleteArticle(req, res) {
        const { id } = req.params;
        const result = await articleService.deleteArticle(id);

        return new OK({
            message: 'Xóa bài viết thành công!',
            metadata: result,
        }).send(res);
    }

    /**
     * Bật/tắt trạng thái Publish (Admin)
     */
    async toggleStatus(req, res) {
        const { id } = req.params;
        const result = await articleService.toggleArticleStatus(id);

        return new OK({
            message: 'Thay đổi trạng thái bài viết thành công!',
            metadata: result,
        }).send(res);
    }
}

module.exports = new ArticleController();
