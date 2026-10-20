const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const BookCopy = sequelize.define('BookCopy', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    copyId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // e.g. 'BK-CC-001'
    },
    dkcbCode: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true, // Mã Đăng ký cá biệt duy nhất e.g. 'DKCB-2026-0001'
    },
    bookId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    warehouseId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    shelfId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('Available', 'Rented', 'Overdue', 'Maintenance', 'Reserved'),
        defaultValue: 'Available',
    },
    statusText: {
        type: DataTypes.STRING,
        defaultValue: 'Có sẵn',
    },
    physicalCondition: {
        type: DataTypes.ENUM('new', 'good', 'fair', 'damaged', 'lost'),
        defaultValue: 'good',
    },
    conditionText: {
        type: DataTypes.STRING,
        defaultValue: 'Rất tốt (95%)',
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Kệ Kho A1',
    },
    rentedTo: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    dueDate: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    note: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'book_copies',
});

module.exports = BookCopy;
