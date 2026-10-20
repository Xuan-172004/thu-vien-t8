const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('info', 'warning', 'success', 'error'),
        defaultValue: 'info',
    },
    category: {
        type: DataTypes.ENUM(
            'card',
            'rental',
            'extension',
            'due_reminder',
            'overdue',
            'purchase',
            'thesis_approval',
            'system'
        ),
        defaultValue: 'system',
    },
    link: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'notifications',
});

module.exports = Notification;
