const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const DigitalDocument = sequelize.define('DigitalDocument', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    docCode: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    author: {
        type: DataTypes.STRING(150),
        allowNull: false,
        defaultValue: 'Tác giả / Sinh viên',
    },
    advisor: {
        type: DataTypes.STRING(150),
        allowNull: true,
        defaultValue: '',
    },
    category: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'CNTT',
    },
    documentType: {
        type: DataTypes.ENUM('thesis', 'ebook', 'journal', 'dissertation'),
        allowNull: false,
        defaultValue: 'thesis',
    },
    publishYear: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2026,
    },
    pages: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50,
    },
    fileSize: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: '5.2 MB',
    },
    pdfFile: {
        type: DataTypes.STRING(500),
        allowNull: false,
        defaultValue: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    },
    previewPages: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
    },
    coverImage: {
        type: DataTypes.STRING(500),
        allowNull: true,
        defaultValue: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
    },
    isForSale: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    status: {
        type: DataTypes.ENUM('active', 'hidden', 'draft'),
        allowNull: false,
        defaultValue: 'active',
    },
    viewCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    downloadCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    tableName: 'digital_documents',
    timestamps: true,
});

module.exports = DigitalDocument;
