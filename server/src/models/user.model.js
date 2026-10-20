const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        fullName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { isEmail: true },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '',
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: '',
        },
        avatar: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: '',
        },
        role: {
            type: DataTypes.ENUM('superadmin', 'admin', 'librarian', 'user'),
            defaultValue: 'user',
        },
        // Phân loại Độc giả: 'student' (Sinh viên/Thành viên), 'guest' (Khách vãng lai), 'staff' (Cán bộ)
        userType: {
            type: DataTypes.ENUM('student', 'guest', 'staff'),
            defaultValue: 'guest',
        },
        // Trạng thái Thẻ thư viện: 'none', 'pending', 'active', 'rejected', 'expired', 'locked', 'revoked'
        cardStatus: {
            type: DataTypes.ENUM('none', 'pending', 'active', 'rejected', 'expired', 'locked', 'revoked'),
            defaultValue: 'none',
        },
        rejectReason: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: '',
        },
        memberCode: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        cardExpiryDate: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        cardAppliedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        maxBorrowLimit: {
            type: DataTypes.INTEGER,
            defaultValue: 5, // Khách vãng lai = 2, Sinh viên = 5
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        typeLogin: {
            type: DataTypes.ENUM('email', 'google'),
            defaultValue: 'email',
        },
        status: {
            type: DataTypes.ENUM('active', 'locked', 'pending'),
            defaultValue: 'active',
        },
        walletBalance: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        refreshToken: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        timestamps: true,
        tableName: 'users',
    },
);

module.exports = User;
