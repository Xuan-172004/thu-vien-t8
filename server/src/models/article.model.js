const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const Article = sequelize.define(
    'Article',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        slug: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
        },
        summary: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        content: {
            type: DataTypes.TEXT('long'),
            allowNull: false,
        },
        thumbnail: {
            type: DataTypes.STRING(500),
            allowNull: true,
            defaultValue: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
        },
        category: {
            type: DataTypes.ENUM('news', 'notice', 'event', 'guide'),
            allowNull: false,
            defaultValue: 'news',
        },
        author: {
            type: DataTypes.STRING(100),
            allowNull: true,
            defaultValue: 'Ban Quản Trị Thư Viện',
        },
        status: {
            type: DataTypes.ENUM('published', 'draft', 'archived'),
            allowNull: false,
            defaultValue: 'published',
        },
        views: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        isFeatured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        publishedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        eventDate: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        eventLocation: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    },
    {
        tableName: 'articles',
        timestamps: true,
    }
);

module.exports = Article;
