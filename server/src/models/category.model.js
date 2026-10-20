const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true, // e.g. 'lap-trinh', 'van-hoc'
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    icon: {
        type: DataTypes.STRING,
        defaultValue: 'BookOpen',
    },
    color: {
        type: DataTypes.STRING,
        defaultValue: 'bg-amber-500',
    },
    image: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: '',
    },
    count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    timestamps: true,
    tableName: 'categories',
});

module.exports = Category;
