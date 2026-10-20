const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const DepositTransaction = sequelize.define('DepositTransaction', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    txnRef: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // e.g. 'DEP-1789218312938'
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    paymentMethod: {
        type: DataTypes.STRING, // 'vnpay' or 'momo'
        allowNull: false,
    },
    payUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING, // 'pending', 'success', 'failed'
        defaultValue: 'pending',
    },
}, {
    timestamps: true,
    tableName: 'deposit_transactions',
});

module.exports = DepositTransaction;
