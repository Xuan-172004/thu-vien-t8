const { sequelize } = require('./connectDB');
const models = require('../models');

async function addColumnIfNotExists(tableName, columnName, columnSql) {
    try {
        const [results] = await sequelize.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '${tableName}' AND COLUMN_NAME = '${columnName}';`
        );
        if (results.length === 0) {
            console.log(`🔨 Đang thêm cột '${columnName}' vào bảng '${tableName}'...`);
            await sequelize.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${columnSql};`);
            console.log(`✅ Đã thêm cột '${columnName}' vào bảng '${tableName}' thành công!`);
        }
    } catch (err) {
        console.warn(`⚠️ Lỗi khi thêm cột '${columnName}':`, err.message);
    }
}

async function syncAndSeedDatabase() {
    console.log('🔄 Bắt đầu đồng bộ & cập nhật lại cấu trúc CSDL MySQL...');

    try {
        await sequelize.authenticate();
        console.log('✅ Đã kết nối thành công tới MySQL Database!');

        // Sync all models with MySQL schema (creates missing tables)
        await sequelize.sync();
        console.log('✅ Đã đồng bộ tất cả Bảng (Tables) mới vào MySQL!');

        // Check and Add Missing Columns for Books Table
        await addColumnIfNotExists('books', 'slug', 'VARCHAR(255) NULL');
        await addColumnIfNotExists('books', 'ddcCode', "VARCHAR(255) NULL DEFAULT ''");
        await addColumnIfNotExists('books', 'dimensions', "VARCHAR(255) NULL DEFAULT '14.5 x 20.5 x 1.5 cm'");
        await addColumnIfNotExists('books', 'weight', 'INT NULL DEFAULT 350');
        await addColumnIfNotExists('books', 'room', "VARCHAR(255) NULL DEFAULT 'Phòng Kho 01'");
        await addColumnIfNotExists('books', 'floor', "VARCHAR(255) NULL DEFAULT 'Tầng 2'");
        await addColumnIfNotExists('books', 'shelf', "VARCHAR(255) NULL DEFAULT 'Kệ A1-01'");
        await addColumnIfNotExists('books', 'description', 'TEXT NULL');
        await addColumnIfNotExists('books', 'isFeatured', 'TINYINT(1) NULL DEFAULT 0');
        await addColumnIfNotExists('books', 'isVisible', 'TINYINT(1) NULL DEFAULT 1');
        await addColumnIfNotExists('books', 'images', 'JSON NULL');

        // Check and Add Missing Columns for Book_Copies Table
        await addColumnIfNotExists('book_copies', 'dkcbCode', 'VARCHAR(255) NULL');
        await addColumnIfNotExists('book_copies', 'warehouseId', 'VARCHAR(255) NULL');
        await addColumnIfNotExists('book_copies', 'shelfId', 'VARCHAR(255) NULL');
        await addColumnIfNotExists('book_copies', 'physicalCondition', "VARCHAR(50) NULL DEFAULT 'good'");
        await addColumnIfNotExists('book_copies', 'conditionText', "VARCHAR(255) NULL DEFAULT 'Rất tốt (95%)'");

        // Check and Add Missing Columns for Categories Table
        await addColumnIfNotExists('categories', 'slug', 'VARCHAR(255) NULL');
        await addColumnIfNotExists('categories', 'description', 'TEXT NULL');

        // Seed Default Warehouses if empty
        const warehouseCount = await models.Warehouse.count();
        if (warehouseCount === 0) {
            console.log('📦 Đang khởi tạo dữ liệu mẫu cho Kho sách...');
            await models.Warehouse.bulkCreate([
                {
                    id: 'wh-1',
                    name: 'Kho Thư Viện Trung Tâm',
                    code: 'KHO-TT',
                    room: 'Phòng Kho 01',
                    floor: 'Tầng 1',
                    capacity: 5000,
                    currentCount: 1240,
                    description: 'Kho lưu trữ sách chính của thư viện',
                },
                {
                    id: 'wh-2',
                    name: 'Kho Sách Chuyên Ngành CNTT',
                    code: 'KHO-CNTT',
                    room: 'Phòng Kho 03',
                    floor: 'Tầng 2',
                    capacity: 3000,
                    currentCount: 850,
                    description: 'Kho chuyên biệt cho sách công nghệ thông tin & lập trình',
                },
            ]);
            console.log('✅ Đã khởi tạo 02 Kho sách mẫu!');
        }

        // Seed Default Shelves if empty
        const shelfCount = await models.Shelf.count();
        if (shelfCount === 0) {
            console.log('🗄️ Đang khởi tạo dữ liệu mẫu cho Tủ/Kệ sách...');
            await models.Shelf.bulkCreate([
                {
                    id: 'shelf-a1',
                    warehouseId: 'wh-1',
                    name: 'Kệ A1 - Lập trình & CNTT',
                    code: 'KE-A1',
                    floor: 'Tầng 1',
                    capacity: 500,
                    currentCount: 120,
                    description: 'Kệ dành riêng cho sách lập trình web và phần mềm',
                },
                {
                    id: 'shelf-a2',
                    warehouseId: 'wh-1',
                    name: 'Kệ A2 - Thiết kế UX/UI',
                    code: 'KE-A2',
                    floor: 'Tầng 1',
                    capacity: 500,
                    currentCount: 80,
                    description: 'Kệ dành cho sách đồ họa và trải nghiệm người dùng',
                },
                {
                    id: 'shelf-b1',
                    warehouseId: 'wh-2',
                    name: 'Kệ B1 - Cơ sở dữ liệu & AI',
                    code: 'KE-B1',
                    floor: 'Tầng 2',
                    capacity: 500,
                    currentCount: 95,
                    description: 'Kệ dành cho sách SQL, NoSQL và trí tuệ nhân tạo',
                },
                {
                    id: 'shelf-b2',
                    warehouseId: 'wh-2',
                    name: 'Kệ B2 - Kinh tế & Kỹ năng',
                    code: 'KE-B2',
                    floor: 'Tầng 2',
                    capacity: 500,
                    currentCount: 110,
                    description: 'Kệ dành cho sách kỹ năng mềm và quản trị',
                },
            ]);
            console.log('✅ Đã khởi tạo 04 Tủ/Kệ sách mẫu!');
        }

        // Seed Default Rental Policies if empty
        const policyCount = await models.RentalPolicy.count();
        if (policyCount === 0) {
            console.log('⚙️ Đang khởi tạo dữ liệu chính sách mượn & phạt mẫu...');
            await models.RentalPolicy.bulkCreate([
                {
                    id: 'student',
                    cardType: 'student',
                    cardTypeName: 'Thẻ Sinh Viên',
                    maxBorrowDays: 14,
                    maxBorrowBooks: 5,
                    allowHomeBorrow: true,
                    allowRoomRead: true,
                    maxExtensions: 2,
                    extensionDays: 7,
                    overdueFinePerDay: 5000,
                    damagedBookFinePercent: 50,
                    lostBookFinePercent: 200,
                    specialDocFineRate: 10000,
                    autoLockDaysOverdue: 30,
                    description: 'Chính sách áp dụng cho thẻ mượn Sinh viên chính quy',
                },
                {
                    id: 'teacher',
                    cardType: 'teacher',
                    cardTypeName: 'Thẻ Giảng Viên / Cán Bộ',
                    maxBorrowDays: 30,
                    maxBorrowBooks: 10,
                    allowHomeBorrow: true,
                    allowRoomRead: true,
                    maxExtensions: 3,
                    extensionDays: 14,
                    overdueFinePerDay: 3000,
                    damagedBookFinePercent: 50,
                    lostBookFinePercent: 150,
                    specialDocFineRate: 5000,
                    autoLockDaysOverdue: 60,
                    description: 'Chính sách ưu đãi mở rộng dành cho Giảng viên & Cán bộ trường',
                },
                {
                    id: 'guest',
                    cardType: 'guest',
                    cardTypeName: 'Thẻ Khách Vãng Lai',
                    maxBorrowDays: 7,
                    maxBorrowBooks: 3,
                    allowHomeBorrow: false,
                    allowRoomRead: true,
                    maxExtensions: 1,
                    extensionDays: 3,
                    overdueFinePerDay: 10000,
                    damagedBookFinePercent: 100,
                    lostBookFinePercent: 250,
                    specialDocFineRate: 15000,
                    autoLockDaysOverdue: 15,
                    description: 'Chính sách áp dụng cho thẻ mượn đọc tại chỗ của Khách vãng lai',
                },
            ]);
            console.log('✅ Đã khởi tạo 03 Chính sách mượn & phạt mẫu!');
        }

        console.log('🎉 Hoàn tất đồng bộ CSDL MySQL thành công 100%!');
    } catch (err) {
        console.error('❌ Lỗi khi đồng bộ CSDL:', err.message);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

syncAndSeedDatabase();
