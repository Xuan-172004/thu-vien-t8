const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/connectDB');

const Book = sequelize.define('Book', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true, // e.g. 'b1', 'b2'
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    categoryId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    categoryName: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Chưa phân loại',
    },
    publisher: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    isbn: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    ddcCode: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '',
    },
    pages: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    language: {
        type: DataTypes.STRING,
        defaultValue: 'Tiếng Việt',
    },
    translator: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    dimensions: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: '14.5 x 20.5 x 1.5 cm',
    },
    weight: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 350,
    },
    cover: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
    },
    images: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
    },
    thumbnails: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
    },
    rating: {
        type: DataTypes.FLOAT,
        defaultValue: 4.8,
    },
    reviewsCount: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
    },
    rentCount: {
        type: DataTypes.INTEGER,
        defaultValue: 500,
    },
    price7Days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 15000,
    },
    price14Days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 25000,
    },
    price30Days: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 45000,
    },
    deposit: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50000,
    },
    marketPrice: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    availabilityStatus: {
        type: DataTypes.ENUM('available', 'low_stock', 'rented_out'),
        defaultValue: 'available',
    },
    totalCopies: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
    },
    availableCopies: {
        type: DataTypes.INTEGER,
        defaultValue: 3,
    },
    room: {
        type: DataTypes.STRING,
        defaultValue: 'Phòng Kho 01',
    },
    floor: {
        type: DataTypes.STRING,
        defaultValue: 'Tầng 2',
    },
    shelf: {
        type: DataTypes.STRING,
        defaultValue: 'Kệ A1-01',
    },
    location: {
        type: DataTypes.STRING,
        defaultValue: 'Thư viện Trung tâm',
    },
    supportDelivery: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    condition: {
        type: DataTypes.STRING,
        defaultValue: 'Rất tốt (95%)',
    },
    summary: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    isVisible: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    timestamps: true,
    tableName: 'books',
});

module.exports = Book;
