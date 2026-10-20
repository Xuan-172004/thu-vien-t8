const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const Warehouse = sequelize.define('Warehouse', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true, // e.g. 'wh-main'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    room: {
        type: DataTypes.STRING,
        defaultValue: 'Phòng Kho 01',
    },
    floor: {
        type: DataTypes.STRING,
        defaultValue: 'Tầng 1',
    },
    capacity: {
        type: DataTypes.INTEGER,
        defaultValue: 5000,
    },
    currentCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
        defaultValue: 'active',
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'warehouses',
});

module.exports = Warehouse;
