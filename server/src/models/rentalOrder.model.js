const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const RentalOrder = sequelize.define('RentalOrder', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    orderCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // e.g. 'PM-2026-0001'
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    customerName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    borrowType: {
        type: DataTypes.STRING,
        defaultValue: 'home', // 'home' (mượn về nhà) or 'room' (đọc tại chỗ)
    },
    deliveryMethod: {
        type: DataTypes.STRING,
        defaultValue: 'library',
    },
    paymentMethod: {
        type: DataTypes.STRING,
        defaultValue: 'cash',
    },
    rentTotal: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    depositTotal: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    deliveryFee: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    fineAmount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    grandTotal: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    pickupDate: {
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
    extensionsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Pending', // 'Pending', 'Approved', 'Rented', 'Overdue', 'Returned', 'Rejected', 'Cancelled'
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'rental_orders',
});

module.exports = RentalOrder;
