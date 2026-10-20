const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const DigitalDocPurchase = sequelize.define(
    'DigitalDocPurchase',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        digitalDocId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        docCode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        docTitle: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        amount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        paymentMethod: {
            type: DataTypes.ENUM('wallet', 'vnpay', 'free'),
            defaultValue: 'wallet',
        },
        status: {
            type: DataTypes.ENUM('completed', 'pending', 'cancelled'),
            defaultValue: 'completed',
        },
        purchasedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        timestamps: true,
        tableName: 'digital_doc_purchases',
    }
);

module.exports = DigitalDocPurchase;
