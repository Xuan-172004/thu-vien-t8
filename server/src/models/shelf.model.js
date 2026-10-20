const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const Shelf = sequelize.define('Shelf', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true, // e.g. 'shelf-a1'
    },
    warehouseId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    floor: {
        type: DataTypes.STRING,
        defaultValue: 'Tầng 1',
    },
    capacity: {
        type: DataTypes.INTEGER,
        defaultValue: 500,
    },
    currentCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'shelves',
});

module.exports = Shelf;
