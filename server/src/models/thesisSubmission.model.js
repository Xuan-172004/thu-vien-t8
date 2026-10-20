const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const ThesisSubmission = sequelize.define('ThesisSubmission', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    studentName: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    studentId: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    faculty: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: 'CNTT',
    },
    major: {
        type: DataTypes.STRING(150),
        allowNull: true,
        defaultValue: 'Kỹ thuật phần mềm',
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    author: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    coAuthors: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: '',
    },
    advisor: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    thesisType: {
        type: DataTypes.ENUM('bachelor', 'master', 'doctoral', 'scientific_paper'),
        allowNull: false,
        defaultValue: 'bachelor',
    },
    defenseYear: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2026,
    },
    pages: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 80,
    },
    fileSize: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: '5.0 MB',
    },
    pdfFile: {
        type: DataTypes.STRING(500),
        allowNull: false,
    },
    coverImage: {
        type: DataTypes.STRING(500),
        allowNull: true,
        defaultValue: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80',
    },
    abstract: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    keywords: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: '',
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
    },
    rejectReason: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    reviewedBy: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    digitalDocId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    tableName: 'thesis_submissions',
    timestamps: true,
});

module.exports = ThesisSubmission;
