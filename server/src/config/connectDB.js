const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = process.env.MYSQL_URI
    ? new Sequelize(process.env.MYSQL_URI, {
          dialect: 'mysql',
          logging: false,
          pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
      })
    : new Sequelize(
          process.env.MYSQL_DATABASE || 'thuesach_db',
          process.env.MYSQL_USER || 'root',
          process.env.MYSQL_PASSWORD || 'ttluan113',
          {
              host: process.env.MYSQL_HOST || 'localhost',
              port: process.env.MYSQL_PORT || 3306,
              dialect: 'mysql',
              logging: false,
              pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
          }
      );

async function addColumnIfNotExists(tableName, columnName, columnSql) {
    try {
        const [results] = await sequelize.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${tableName}' AND COLUMN_NAME = '${columnName}';`
        );
        if (results.length === 0) {
            console.log(`🔨 [Auto Migration] Đang thêm cột '${columnName}' vào bảng '${tableName}'...`);
            await sequelize.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${columnSql};`);
            console.log(`✅ [Auto Migration] Đã thêm cột '${columnName}' thành công!`);
        }
    } catch (err) {
        // Silently skip if table or column issue
    }
}

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ MySQL Database connected successfully via Sequelize!');

        // Import all models and associations before sync
        require('../models');

        // Sync models automatically with safe creation
        await sequelize.sync();

        await addColumnIfNotExists('books', 'slug', 'VARCHAR(255) NULL');
        await addColumnIfNotExists('books', 'ddcCode', "VARCHAR(255) NULL DEFAULT ''");
        await addColumnIfNotExists('books', 'dimensions', "VARCHAR(255) NULL DEFAULT '14.5 x 20.5 x 1.5 cm'");
        await addColumnIfNotExists('books', 'weight', 'INT NULL DEFAULT 350');
        await addColumnIfNotExists('books', 'room', "VARCHAR(255) NULL DEFAULT 'Phòng Kho 01'");
        await addColumnIfNotExists('books', 'floor', "VARCHAR(255) NULL DEFAULT 'Tầng 2'");
        await addColumnIfNotExists('books', 'shelf', "VARCHAR(255) NULL DEFAULT 'Kệ A1-01'");
        await addColumnIfNotExists('books', 'summary', 'LONGTEXT NULL');
        await addColumnIfNotExists('books', 'description', 'LONGTEXT NULL');
        await addColumnIfNotExists('books', 'isFeatured', 'TINYINT(1) NULL DEFAULT 0');
        await addColumnIfNotExists('books', 'isVisible', 'TINYINT(1) NULL DEFAULT 1');
        await addColumnIfNotExists('books', 'images', 'JSON NULL');

        try {
            await sequelize.query("ALTER TABLE books MODIFY COLUMN cover LONGTEXT NULL;");
            await sequelize.query("ALTER TABLE books MODIFY COLUMN categoryName VARCHAR(255) NULL DEFAULT 'Chưa phân loại';");
            await sequelize.query("ALTER TABLE books MODIFY COLUMN isbn VARCHAR(255) NULL;");
            await sequelize.query("ALTER TABLE books MODIFY COLUMN description LONGTEXT NULL;");
            await sequelize.query("ALTER TABLE books MODIFY COLUMN summary LONGTEXT NULL;");
        } catch (e) {
            console.warn('Modify books column warning:', e.message);
        }

        await addColumnIfNotExists('book_copies', 'dkcbCode', 'VARCHAR(255) NULL');
        await addColumnIfNotExists('book_copies', 'warehouseId', 'VARCHAR(255) NULL');
        await addColumnIfNotExists('book_copies', 'shelfId', 'VARCHAR(255) NULL');
        await addColumnIfNotExists('book_copies', 'physicalCondition', "VARCHAR(50) NULL DEFAULT 'good'");
        await addColumnIfNotExists('book_copies', 'conditionText', "VARCHAR(255) NULL DEFAULT 'Rất tốt (95%)'");

        await addColumnIfNotExists('categories', 'slug', 'VARCHAR(255) NULL');
        await addColumnIfNotExists('categories', 'description', 'TEXT NULL');
        await addColumnIfNotExists('categories', 'image', 'LONGTEXT NULL');

        await addColumnIfNotExists('rental_orders', 'borrowType', "VARCHAR(50) NULL DEFAULT 'home'");
        await addColumnIfNotExists('rental_orders', 'pickupDate', 'VARCHAR(255) NULL');
        await addColumnIfNotExists('rental_orders', 'dueDate', 'VARCHAR(255) NULL');
        await addColumnIfNotExists('rental_orders', 'returnDate', 'VARCHAR(255) NULL');
        await addColumnIfNotExists('rental_orders', 'extensionsCount', 'INT NULL DEFAULT 0');
        await addColumnIfNotExists('rental_orders', 'fineAmount', 'INT NULL DEFAULT 0');
        await addColumnIfNotExists('rental_orders', 'note', 'TEXT NULL');
        await addColumnIfNotExists('rental_orders', 'rejectionReason', 'TEXT NULL');

        try {
            await sequelize.query("ALTER TABLE rental_orders MODIFY COLUMN userId CHAR(36) BINARY NULL;");
            await sequelize.query("ALTER TABLE rental_orders MODIFY COLUMN deliveryMethod VARCHAR(255) NULL DEFAULT 'library';");
            await sequelize.query("ALTER TABLE rental_orders MODIFY COLUMN borrowType VARCHAR(255) NULL DEFAULT 'home';");
            await sequelize.query("ALTER TABLE rental_orders MODIFY COLUMN paymentMethod VARCHAR(255) NULL DEFAULT 'cash';");
            await sequelize.query("ALTER TABLE rental_orders MODIFY COLUMN status VARCHAR(255) NULL DEFAULT 'Pending';");
            
            await sequelize.query("ALTER TABLE rental_items MODIFY COLUMN copyId VARCHAR(255) NULL;");
            await sequelize.query("ALTER TABLE rental_items MODIFY COLUMN dkcbCode VARCHAR(255) NULL;");
            await sequelize.query("ALTER TABLE rental_items MODIFY COLUMN bookCover TEXT NULL;");
            await sequelize.query("ALTER TABLE rental_items MODIFY COLUMN rentDate VARCHAR(255) NULL;");
            await sequelize.query("ALTER TABLE rental_items MODIFY COLUMN dueDate VARCHAR(255) NULL;");
            await sequelize.query("ALTER TABLE rental_items MODIFY COLUMN returnDate VARCHAR(255) NULL;");
            await sequelize.query("ALTER TABLE rental_items MODIFY COLUMN status VARCHAR(255) NULL DEFAULT 'Pending';");
            await sequelize.query("ALTER TABLE rental_items MODIFY COLUMN daysRemaining INT NULL DEFAULT 14;");
            await sequelize.query("ALTER TABLE rental_items MODIFY COLUMN progressPercent INT NULL DEFAULT 0;");
            await sequelize.query("ALTER TABLE rental_items MODIFY COLUMN overdueDays INT NULL DEFAULT 0;");
            await sequelize.query("ALTER TABLE rental_items MODIFY COLUMN penaltyFee INT NULL DEFAULT 0;");
        } catch (e) {
            console.warn('Modify column warning:', e.message);
        }

        await addColumnIfNotExists('rental_items', 'dkcbCode', 'VARCHAR(255) NULL');

        await addColumnIfNotExists('users', 'walletBalance', 'INT NULL DEFAULT 0');

        await addColumnIfNotExists('rental_policies', 'dailyRateTier1', 'INT NULL DEFAULT 5000');
        await addColumnIfNotExists('rental_policies', 'dailyRateTier2', 'INT NULL DEFAULT 3000');
        await addColumnIfNotExists('rental_policies', 'dailyRateTier3', 'INT NULL DEFAULT 2000');
        await addColumnIfNotExists('rental_policies', 'dailyRateTier4', 'INT NULL DEFAULT 1500');

        console.log('✅ Database models & columns synchronized with MySQL schema.');
    } catch (error) {
        console.error('❌ Unable to connect to MySQL database:', error.message);
        console.log('💡 Tip: Ensure MySQL server is running and MySQL credentials in .env are correct.');
    }
};

module.exports = { sequelize, connectDB };
