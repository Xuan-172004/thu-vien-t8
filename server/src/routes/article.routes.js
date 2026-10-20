const express = require('express');
const router = express.Router();
const ArticleController = require('../controller/article.controller');
const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

// Public routes
router.get('/', asyncHandler(ArticleController.getAllArticles));
router.get('/:slugOrId', asyncHandler(ArticleController.getArticleDetail));

// Admin routes
router.post('/', authAdmin, asyncHandler(ArticleController.createArticle));
router.put('/:id', authAdmin, asyncHandler(ArticleController.updateArticle));
router.delete('/:id', authAdmin, asyncHandler(ArticleController.deleteArticle));
router.patch('/:id/toggle-status', authAdmin, asyncHandler(ArticleController.toggleStatus));

module.exports = router;
