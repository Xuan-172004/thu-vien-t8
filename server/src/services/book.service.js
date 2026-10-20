const { Book, BookCopy, Category, Warehouse, Shelf } = require('../models');
const { Op } = require('sequelize');
const { BadRequestError } = require('../core/error.response');

class BookService {
    async getAllBooks(queryParams = {}) {
        const { category, search, onlyAvailable, sortBy, page = 1, limit = 100 } = queryParams;

        const where = { isVisible: true };
        if (category && category !== 'all') {
            where.categoryId = category;
        }

        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { author: { [Op.like]: `%${search}%` } },
                { isbn: { [Op.like]: `%${search}%` } },
            ];
        }

        if (onlyAvailable === 'true' || onlyAvailable === true) {
            where.availableCopies = { [Op.gt]: 0 };
        }

        let order = [['id', 'ASC']];
        if (sortBy === 'popular') order = [['rentCount', 'DESC']];
        if (sortBy === 'newest') order = [['year', 'DESC']];
        if (sortBy === 'price_asc') order = [['price7Days', 'ASC']];
        if (sortBy === 'rating') order = [['rating', 'DESC']];

        const queryOptions = {
            where,
            order,
            include: [{ model: BookCopy, as: 'copies' }],
        };

        if (limit !== 'all') {
            const parsedLimit = parseInt(limit) || 100;
            const parsedPage = parseInt(page) || 1;
            queryOptions.limit = parsedLimit;
            queryOptions.offset = (parsedPage - 1) * parsedLimit;
        }

        const { rows, count } = await Book.findAndCountAll(queryOptions);

        const parsedLimit = limit === 'all' ? count : (parseInt(limit) || 100);
        return {
            books: rows,
            totalItems: count,
            totalPages: Math.ceil(count / parsedLimit) || 1,
            currentPage: parseInt(page) || 1,
        };
    }

    async getAllBooksAdmin(queryParams = {}) {
        const { category, search, visibility } = queryParams;

        const where = {};
        if (category && category !== 'all') {
            where.categoryId = category;
        }
        if (visibility === 'visible') where.isVisible = true;
        if (visibility === 'hidden') where.isVisible = false;

        if (search) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { author: { [Op.like]: `%${search}%` } },
                { isbn: { [Op.like]: `%${search}%` } },
            ];
        }

        const books = await Book.findAll({
            where,
            order: [['createdAt', 'DESC']],
            include: [{ model: BookCopy, as: 'copies' }],
        });

        return books;
    }

    async getBookById(id) {
        const book = await Book.findByPk(id, {
            include: [{ model: BookCopy, as: 'copies' }],
        });

        if (!book) {
            throw new BadRequestError('Sách không tồn tại');
        }

        return book;
    }

    async createBook(data) {
        const { title, author, categoryId, isbn, totalCopies = 5 } = data;

        if (!title || !author) {
            throw new BadRequestError('Vui lòng nhập đầy đủ tên sách và tác giả');
        }

        if (isbn && isbn.trim()) {
            const existingIsbn = await Book.findOne({ where: { isbn: isbn.trim() } });
            if (existingIsbn) {
                throw new BadRequestError('Mã ISBN đã tồn tại trong thư viện');
            }
        }

        // Validate and resolve Category
        let resolvedCategoryId = categoryId;
        let resolvedCategoryName = data.categoryName || 'Chưa phân loại';
        
        let targetCategory = null;
        if (resolvedCategoryId && resolvedCategoryId !== 'all') {
            targetCategory = await Category.findByPk(resolvedCategoryId);
        }

        if (!targetCategory) {
            // Find first available category in DB
            targetCategory = await Category.findOne({ where: { id: { [Op.ne]: 'all' } } }) || await Category.findOne();
            if (targetCategory) {
                resolvedCategoryId = targetCategory.id;
                resolvedCategoryName = targetCategory.name;
            } else {
                // Auto create fallback category if DB is completely empty
                targetCategory = await Category.create({
                    id: 'cong-nghe',
                    name: 'Công Nghệ Thông Tin & AI',
                    slug: 'cong-nghe-thong-tin-ai',
                    icon: 'Cpu',
                    color: 'bg-blue-600',
                    count: 0
                });
                resolvedCategoryId = targetCategory.id;
                resolvedCategoryName = targetCategory.name;
            }
        } else {
            resolvedCategoryName = targetCategory.name;
        }

        const bookId = data.id || `b-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const parsedCopies = Math.max(1, parseInt(totalCopies) || 5);

        // Auto generate clean slug
        const rawSlug = data.slug || (title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-'));

        const book = await Book.create({
            ...data,
            id: bookId,
            slug: rawSlug || bookId,
            categoryId: resolvedCategoryId,
            categoryName: resolvedCategoryName,
            isbn: (isbn && isbn.trim()) ? isbn.trim() : `ISBN-${Date.now().toString().slice(-6)}`,
            price7Days: parseInt(data.price7Days) || 15000,
            price14Days: parseInt(data.price14Days) || 25000,
            price30Days: parseInt(data.price30Days) || 45000,
            deposit: parseInt(data.deposit) || 50000,
            marketPrice: parseInt(data.marketPrice) || 150000,
            totalCopies: parsedCopies,
            availableCopies: parsedCopies,
            availabilityStatus: 'available',
            cover: data.cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
            images: Array.isArray(data.images) ? data.images : (data.cover ? [data.cover] : []),
            isFeatured: !!data.isFeatured,
            isVisible: data.isVisible !== undefined ? data.isVisible : true,
            summary: data.summary || data.description || '',
            description: data.description || data.summary || '',
        });

        // Auto generate initial physical copies with guaranteed unique copyId and dkcbCode
        const copyList = [];
        const cleanIdPart = book.id.replace(/[^a-zA-Z0-9]/g, '').slice(-6);
        const currentYear = new Date().getFullYear();

        // Resolve valid warehouseId
        let resolvedWarehouseId = data.warehouseId;
        if (!resolvedWarehouseId || resolvedWarehouseId === 'WH-MAIN') {
            if (resolvedCategoryId === 'kinh-te') {
                resolvedWarehouseId = 'wh-kinhte';
            } else if (['van-hoc', 'tam-ly', 'ky-nang', 'ngoai-ngu'].includes(resolvedCategoryId)) {
                resolvedWarehouseId = 'wh-thamkhao';
            } else {
                resolvedWarehouseId = 'wh-cntt';
            }
            const whExists = await Warehouse.findByPk(resolvedWarehouseId);
            if (!whExists) {
                const firstWh = await Warehouse.findOne();
                if (firstWh) resolvedWarehouseId = firstWh.id;
            }
        }

        // Resolve valid shelfId
        let resolvedShelfId = data.shelfId;
        if (!resolvedShelfId && resolvedWarehouseId) {
            const firstShelf = await Shelf.findOne({ where: { warehouseId: resolvedWarehouseId } });
            if (firstShelf) resolvedShelfId = firstShelf.id;
        }

        for (let i = 1; i <= parsedCopies; i++) {
            const copyCode = `CP-${book.id}-${i}`;
            const dkcbCode = `DKCB-${currentYear}-${cleanIdPart}-${String(i).padStart(3, '0')}`;
            copyList.push({
                bookId: book.id,
                copyId: copyCode,
                dkcbCode: dkcbCode,
                warehouseId: resolvedWarehouseId || null,
                shelfId: resolvedShelfId || null,
                status: 'Available',
                statusText: 'Có sẵn trong kho',
                physicalCondition: 'new',
                conditionText: 'Mới 100%',
                location: data.location || `${data.room || 'Phòng Kho 01'} - ${data.shelf || 'Kệ A1-01'} (Vị trí ${i})`,
                note: 'Sẵn sàng phục vụ bạn đọc',
            });
        }
        await BookCopy.bulkCreate(copyList);

        // Update warehouse count
        if (resolvedWarehouseId) {
            const whCount = await BookCopy.count({ where: { warehouseId: resolvedWarehouseId } });
            await Warehouse.update({ currentCount: whCount }, { where: { id: resolvedWarehouseId } });
        }

        // Update category count
        if (targetCategory) {
            targetCategory.count = (targetCategory.count || 0) + 1;
            await targetCategory.save();
        }

        return this.getBookById(book.id);
    }

    async updateBook(id, data) {
        const book = await Book.findByPk(id);
        if (!book) {
            throw new BadRequestError('Đầu sách không tồn tại');
        }

        // Handle category count change if category changed
        if (data.categoryId && data.categoryId !== book.categoryId) {
            const oldCat = await Category.findByPk(book.categoryId);
            if (oldCat && oldCat.count > 0) {
                oldCat.count -= 1;
                await oldCat.save();
            }
            const newCat = await Category.findByPk(data.categoryId);
            if (newCat) {
                newCat.count = (newCat.count || 0) + 1;
                await newCat.save();
                data.categoryName = newCat.name;
            }
        }

        if (data.totalCopies !== undefined) {
            data.totalCopies = parseInt(data.totalCopies) || book.totalCopies;
        }

        await book.update({
            ...data,
            summary: data.summary || data.description || book.summary,
            description: data.description || data.summary || book.description,
        });

        return this.getBookById(id);
    }

    async deleteBook(id) {
        const book = await Book.findByPk(id);
        if (!book) {
            throw new BadRequestError('Đầu sách không tồn tại');
        }

        // Delete associated copies
        await BookCopy.destroy({ where: { bookId: id } });

        // Decrease category count
        const cat = await Category.findByPk(book.categoryId);
        if (cat && cat.count > 0) {
            cat.count -= 1;
            await cat.save();
        }

        await book.destroy();
        return { message: 'Đã xóa đầu sách thành công' };
    }

    async toggleVisibilityBook(id) {
        const book = await Book.findByPk(id);
        if (!book) {
            throw new BadRequestError('Đầu sách không tồn tại');
        }
        book.isVisible = !book.isVisible;
        await book.save();
        return book;
    }

    // Categories Methods
    async getCategories() {
        return await Category.findAll({ order: [['count', 'DESC']] });
    }

    async createCategory(data) {
        const { id, name, description, icon, color, image } = data;
        const catId = id || name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-');

        const existing = await Category.findByPk(catId);
        if (existing) {
            await existing.update({
                name,
                description: description !== undefined ? description : existing.description,
                image: image !== undefined ? image : existing.image,
                icon: icon || existing.icon,
                color: color || existing.color,
            });
            return existing;
        }

        return await Category.create({
            id: catId,
            name,
            slug: catId,
            description: description || '',
            image: image || '',
            icon: icon || 'BookOpen',
            color: color || 'bg-amber-500',
            count: 0,
        });
    }

    async updateCategory(id, data) {
        const category = await Category.findByPk(id);
        if (!category) {
            throw new BadRequestError('Thể loại không tồn tại');
        }
        await category.update(data);
        return category;
    }

    async deleteCategory(id) {
        const category = await Category.findByPk(id);
        if (!category) {
            throw new BadRequestError('Thể loại không tồn tại');
        }
        await category.destroy();
        return { message: 'Đã xóa thể loại thành công' };
    }

    async addBookCopy(bookId, copyCode) {
        const book = await Book.findByPk(bookId);
        if (!book) throw new BadRequestError('Đầu sách không tồn tại');

        const existingCopy = await BookCopy.findOne({ where: { copyId: copyCode } });
        if (existingCopy) throw new BadRequestError('Mã bản sách đã tồn tại');

        const newCopy = await BookCopy.create({
            bookId,
            copyId: copyCode,
            status: 'Available',
            statusText: 'Có sẵn',
            location: 'Kệ Kho Mới',
        });

        book.totalCopies += 1;
        book.availableCopies += 1;
        await book.save();

        return newCopy;
    }

    async updateCopyStatus(copyId, status) {
        const copy = await BookCopy.findOne({ where: { copyId } });
        if (!copy) throw new BadRequestError('Bản sách không tồn tại');

        const statusTextMap = {
            Available: 'Có sẵn',
            Rented: 'Đang được thuê',
            Overdue: 'Quá hạn',
            Maintenance: 'Bảo trì',
            Reserved: 'Đã đặt trước',
        };

        const oldStatus = copy.status;
        copy.status = status;
        copy.statusText = statusTextMap[status] || status;
        await copy.save();

        const book = await Book.findByPk(copy.bookId);
        if (book) {
            const availCount = await BookCopy.count({
                where: { bookId: copy.bookId, status: 'Available' },
            });
            book.availableCopies = availCount;
            book.availabilityStatus = availCount > 1 ? 'available' : availCount === 1 ? 'low_stock' : 'rented_out';
            await book.save();
        }

        return copy;
    }
}

module.exports = new BookService();
