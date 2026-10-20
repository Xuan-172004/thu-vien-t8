const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const RentalItem = sequelize.define('RentalItem', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    orderId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    bookId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    bookTitle: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    bookCover: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    copyId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    dkcbCode: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    durationDays: {
        type: DataTypes.INTEGER,
        defaultValue: 14,
    },
    rentFee: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    depositFee: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    rentDate: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    dueDate: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    returnDate: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    daysRemaining: {
        type: DataTypes.INTEGER,
        defaultValue: 14,
    },
    progressPercent: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Pending', // 'Pending', 'Active', 'Overdue', 'Returned', 'Damaged', 'Lost'
    },
    overdueDays: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    penaltyFee: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    timestamps: true,
    tableName: 'rental_items',
});

module.exports = RentalItem;
