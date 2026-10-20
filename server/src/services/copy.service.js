const { BookCopy, Book, Warehouse, Shelf } = require('../models');
const { Op } = require('sequelize');
const { BadRequestError } = require('../core/error.response');

class CopyService {
    async getAllCopies(queryParams = {}) {
        const { search, warehouseId, shelfId, status, physicalCondition, bookId } = queryParams;

        const where = {};
        if (bookId) where.bookId = bookId;
        if (warehouseId) where.warehouseId = warehouseId;
        if (shelfId) where.shelfId = shelfId;
        if (status) {
            if (status.toLowerCase() === 'available') {
                where.status = { [Op.or]: ['Available', 'available'] };
            } else if (status.toLowerCase() === 'rented') {
                where.status = { [Op.or]: ['Rented', 'rented'] };
            } else {
                where.status = status;
            }
        }
        if (physicalCondition) where.physicalCondition = physicalCondition;

        if (search) {
            where[Op.or] = [
                { dkcbCode: { [Op.like]: `%${search}%` } },
                { copyId: { [Op.like]: `%${search}%` } },
                { location: { [Op.like]: `%${search}%` } },
            ];
        }

        const copies = await BookCopy.findAll({
            where,
            order: [['createdAt', 'DESC']],
            include: [
                { model: Book, as: 'book', attributes: ['id', 'title', 'isbn', 'author', 'cover'] },
                { model: Warehouse, as: 'warehouse', attributes: ['id', 'name', 'code'] },
                { model: Shelf, as: 'shelf', attributes: ['id', 'name', 'code'] },
            ],
        });

        return copies;
    }

    async batchCreateCopies(data) {
        const { bookId, count = 5, warehouseId, shelfId, physicalCondition = 'good', location } = data;

        const book = await Book.findByPk(bookId);
        if (!book) throw new BadRequestError('Đầu sách không tồn tại');

        const parsedCount = Math.max(1, parseInt(count) || 1);

        let resolvedLocation = location || 'Kệ Kho A1-01';
        let resolvedWarehouseId = warehouseId;
        let resolvedShelfId = shelfId;

        if (resolvedShelfId) {
            const shelfObj = await Shelf.findByPk(resolvedShelfId, { include: [{ model: Warehouse, as: 'warehouse' }] });
            if (shelfObj) {
                resolvedLocation = `${shelfObj.name} (${shelfObj.code})`;
                if (!resolvedWarehouseId && shelfObj.warehouseId) {
                    resolvedWarehouseId = shelfObj.warehouseId;
                }
            }
        } else if (resolvedWarehouseId) {
            const whObj = await Warehouse.findByPk(resolvedWarehouseId);
            if (whObj) {
                resolvedLocation = `${whObj.name} (${whObj.code})`;
            }
        }

        // If no warehouse specified, pick first available warehouse
        if (!resolvedWarehouseId) {
            const firstWh = await Warehouse.findOne();
            if (firstWh) {
                resolvedWarehouseId = firstWh.id;
            }
        }

        const existingCount = await BookCopy.count({ where: { bookId } });
        const cleanIdPart = book.id.replace(/[^a-zA-Z0-9]/g, '').slice(-6);
        const currentYear = new Date().getFullYear();
        const randSuffix = Math.floor(1000 + Math.random() * 9000);

        const copyList = [];
        const conditionTextMap = {
            new: 'Mới 100%',
            good: 'Rất tốt (95%)',
            fair: 'Cũ (80%)',
            damaged: 'Hỏng hóc',
            lost: 'Mất sách',
        };

        for (let i = 1; i <= parsedCount; i++) {
            const indexNumber = existingCount + i;
            const copyId = `CP-${book.id}-${indexNumber}-${randSuffix}`;
            const dkcbCode = `DKCB-${currentYear}-${cleanIdPart}-${String(indexNumber).padStart(4, '0')}`;

            copyList.push({
                bookId,
                copyId,
                dkcbCode,
                warehouseId: resolvedWarehouseId || null,
                shelfId: resolvedShelfId || null,
                status: 'Available',
                statusText: 'Có sẵn trong kho',
                physicalCondition,
                conditionText: conditionTextMap[physicalCondition] || 'Rất tốt (95%)',
                location: resolvedLocation,
                note: 'Cấp mã ĐKCB bổ sung',
            });
        }

        const createdCopies = await BookCopy.bulkCreate(copyList);

        // Update Book Total & Available Copies
        book.totalCopies = (book.totalCopies || 0) + parsedCount;
        book.availableCopies = (book.availableCopies || 0) + parsedCount;
        book.availabilityStatus = 'available';
        await book.save();

        // Update Warehouse current count
        if (resolvedWarehouseId) {
            const totalWhCopies = await BookCopy.count({ where: { warehouseId: resolvedWarehouseId } });
            await Warehouse.update({ currentCount: totalWhCopies }, { where: { id: resolvedWarehouseId } });
        }

        return createdCopies;
    }

    async transferCopy(id, data) {
        const copy = await BookCopy.findByPk(id);
        if (!copy) throw new BadRequestError('Mã bản sách không tồn tại');

        const { warehouseId, shelfId, location } = data;
        const oldWarehouseId = copy.warehouseId;

        if (warehouseId) copy.warehouseId = warehouseId;
        if (shelfId) {
            copy.shelfId = shelfId;
            const shelfObj = await Shelf.findByPk(shelfId);
            if (shelfObj) {
                copy.location = `${shelfObj.name} (${shelfObj.code})`;
                if (!warehouseId && shelfObj.warehouseId) {
                    copy.warehouseId = shelfObj.warehouseId;
                }
            }
        }
        if (location) copy.location = location;

        await copy.save();

        // Sync warehouse counts
        if (oldWarehouseId) {
            const oldWhCount = await BookCopy.count({ where: { warehouseId: oldWarehouseId } });
            await Warehouse.update({ currentCount: oldWhCount }, { where: { id: oldWarehouseId } });
        }
        if (copy.warehouseId && copy.warehouseId !== oldWarehouseId) {
            const newWhCount = await BookCopy.count({ where: { warehouseId: copy.warehouseId } });
            await Warehouse.update({ currentCount: newWhCount }, { where: { id: copy.warehouseId } });
        }

        return copy;
    }

    async updateCondition(id, data) {
        const copy = await BookCopy.findByPk(id);
        if (!copy) throw new BadRequestError('Mã bản sách không tồn tại');

        const { physicalCondition, status, note } = data;
        const conditionTextMap = {
            new: 'Mới 100%',
            good: 'Rất tốt (95%)',
            fair: 'Cũ (80%)',
            damaged: 'Hỏng hóc',
            lost: 'Mất sách',
        };

        if (physicalCondition) {
            copy.physicalCondition = physicalCondition;
            copy.conditionText = conditionTextMap[physicalCondition] || physicalCondition;
        }
        if (status) {
            copy.status = status;
            const statusTextMap = {
                Available: 'Có sẵn trong kho',
                Rented: 'Đang được thuê',
                Overdue: 'Quá hạn',
                Maintenance: 'Bảo trì',
                Reserved: 'Đã đặt trước',
            };
            copy.statusText = statusTextMap[status] || status;
        }
        if (note !== undefined) copy.note = note;

        await copy.save();
        return copy;
    }

    async deleteCopy(id) {
        const copy = await BookCopy.findByPk(id);
        if (!copy) throw new BadRequestError('Mã bản sách không tồn tại');

        const whId = copy.warehouseId;
        const book = await Book.findByPk(copy.bookId);
        if (book) {
            if (book.totalCopies > 0) book.totalCopies -= 1;
            if (book.availableCopies > 0) book.availableCopies -= 1;
            await book.save();
        }

        await copy.destroy();

        if (whId) {
            const count = await BookCopy.count({ where: { warehouseId: whId } });
            await Warehouse.update({ currentCount: count }, { where: { id: whId } });
        }

        return { message: 'Đã xóa bản sao sách thành công' };
    }

    // Warehouse & Shelf Management
    async getAllWarehouses() {
        const warehouses = await Warehouse.findAll({
            order: [['createdAt', 'ASC']],
            include: [{ model: Shelf, as: 'shelves' }],
        });

        // Compute actual count of physical copies in each warehouse
        const result = [];
        for (const wh of warehouses) {
            const copyCount = await BookCopy.count({
                where: { warehouseId: wh.id },
            });
            const whJson = wh.toJSON();
            whJson.currentCount = copyCount;
            result.push(whJson);
        }

        return result;
    }

    async createWarehouse(data) {
        const { name, code, room, floor, capacity, description } = data;
        const whId = data.id || `wh-${Date.now()}`;
        const whCode = code || `KHO-${Date.now().toString().slice(-4)}`;

        const existing = await Warehouse.findOne({ where: { code: whCode } });
        if (existing) throw new BadRequestError('Mã kho đã tồn tại!');

        return await Warehouse.create({
            id: whId,
            name,
            code: whCode,
            room: room || 'Phòng Kho 01',
            floor: floor || 'Tầng 1',
            capacity: parseInt(capacity) || 5000,
            description: description || '',
        });
    }

    async updateWarehouse(id, data) {
        const warehouse = await Warehouse.findByPk(id);
        if (!warehouse) throw new BadRequestError('Kho sách không tồn tại');
        await warehouse.update(data);
        return warehouse;
    }

    async deleteWarehouse(id) {
        const warehouse = await Warehouse.findByPk(id);
        if (!warehouse) throw new BadRequestError('Kho sách không tồn tại');
        await warehouse.destroy();
        return { message: 'Đã xóa kho sách' };
    }

    async getAllShelves(warehouseId) {
        const where = warehouseId ? { warehouseId } : {};
        return await Shelf.findAll({
            where,
            order: [['createdAt', 'DESC']],
            include: [{ model: Warehouse, as: 'warehouse' }],
        });
    }

    async createShelf(data) {
        const { warehouseId, name, code, floor, capacity, description } = data;
        const shelfId = data.id || `shelf-${Date.now()}`;

        return await Shelf.create({
            id: shelfId,
            warehouseId,
            name,
            code,
            floor: floor || 'Tầng 1',
            capacity: capacity || 500,
            description,
        });
    }

    async updateShelf(id, data) {
        const shelf = await Shelf.findByPk(id);
        if (!shelf) throw new BadRequestError('Tủ/kệ sách không tồn tại');
        await shelf.update(data);
        return shelf;
    }

    async deleteShelf(id) {
        const shelf = await Shelf.findByPk(id);
        if (!shelf) throw new BadRequestError('Tủ/kệ sách không tồn tại');
        await shelf.destroy();
        return { message: 'Đã xóa tủ/kệ sách' };
    }
}

module.exports = new CopyService();
