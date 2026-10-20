const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const RentalPolicy = sequelize.define(
    'RentalPolicy',
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        cardType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cardTypeName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        maxBorrowDays: {
            type: DataTypes.INTEGER,
            defaultValue: 14,
        },
        maxBorrowBooks: {
            type: DataTypes.INTEGER,
            defaultValue: 5,
        },
        allowHomeBorrow: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        allowRoomRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        maxExtensions: {
            type: DataTypes.INTEGER,
            defaultValue: 2,
        },
        extensionDays: {
            type: DataTypes.INTEGER,
            defaultValue: 7,
        },
        overdueFinePerDay: {
            type: DataTypes.INTEGER,
            defaultValue: 5000,
        },
        damagedBookFinePercent: {
            type: DataTypes.INTEGER,
            defaultValue: 50,
        },
        lostBookFinePercent: {
            type: DataTypes.INTEGER,
            defaultValue: 200,
        },
        specialDocFineRate: {
            type: DataTypes.INTEGER,
            defaultValue: 10000,
        },
        autoLockDaysOverdue: {
            type: DataTypes.INTEGER,
            defaultValue: 30,
        },
        dailyRateTier1: {
            type: DataTypes.INTEGER,
            defaultValue: 5000, // 1-7 ngày
        },
        dailyRateTier2: {
            type: DataTypes.INTEGER,
            defaultValue: 3000, // 8-14 ngày
        },
        dailyRateTier3: {
            type: DataTypes.INTEGER,
            defaultValue: 2000, // 15-30 ngày
        },
        dailyRateTier4: {
            type: DataTypes.INTEGER,
            defaultValue: 1500, // Trên 30 ngày
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: 'rental_policies',
        timestamps: true,
    }
);

module.exports = RentalPolicy;
