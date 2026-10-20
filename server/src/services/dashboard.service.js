const { Op } = require('sequelize');
const {
    User,
    Book,
    BookCopy,
    Category,
    RentalOrder,
    RentalItem,
    DigitalDocument,
    DigitalDocPurchase,
    ThesisSubmission,
} = require('../models');

class DashboardService {
    /**
     * 7.1. Lấy tất cả các thẻ chỉ số tổng quan (Stat Cards)
     */
    async getOverviewStats() {
        // 1. Bạn đọc & Thẻ thư viện
        const totalUsers = await User.count({ where: { role: 'user' } });
        const activeCards = await User.count({ where: { cardStatus: 'active' } });
        const pendingCards = await User.count({ where: { cardStatus: 'pending' } });
        const lockedCards = await User.count({ where: { cardStatus: 'locked' } });
        const expiredCards = await User.count({
            where: {
                cardStatus: 'active',
                cardExpiryDate: { [Op.lt]: new Date().toISOString().slice(0, 10) },
            },
        });

        // 2. Đầu sách & Bản sao vật lý
        const totalBooks = await Book.count();
        const totalPhysicalCopies = await BookCopy.count();
        const availableCopies = await BookCopy.count({ where: { status: 'available' } });
        const rentingCopies = await BookCopy.count({ where: { status: 'rented' } });
        const lostCopies = await BookCopy.count({ where: { status: 'lost' } });

        // 3. Tài liệu số & Đồ án
        const totalDigitalDocs = await DigitalDocument.count({ where: { status: 'active' } });
        const totalTheses = await DigitalDocument.count({ where: { category: 'thesis', status: 'active' } });
        const totalPurchases = await DigitalDocPurchase.count({ where: { status: 'completed' } });
        const totalDigitalDocRevenueResult = await DigitalDocPurchase.sum('amount', { where: { status: 'completed' } });
        const totalDigitalDocRevenue = Number(totalDigitalDocRevenueResult) || 0;

        // 4. Mượn - Trả sách & Quá hạn & Tiền phạt
        const totalOrders = await RentalOrder.count();
        const activeBorrowOrders = await RentalOrder.count({
            where: { status: { [Op.in]: ['Rented', 'Approved', 'Active'] } },
        });
        const completedOrders = await RentalOrder.count({
            where: { status: { [Op.in]: ['Returned', 'Completed'] } },
        });
        const overdueOrders = await RentalOrder.count({
            where: {
                [Op.or]: [
                    { status: 'Overdue' },
                    {
                        status: { [Op.in]: ['Rented', 'Active'] },
                        dueDate: { [Op.lt]: new Date().toISOString().slice(0, 10) },
                    },
                ],
            },
        });

        const totalFinesResult = await RentalItem.sum('penaltyFee', {
            where: { penaltyFee: { [Op.gt]: 0 } },
        });
        const totalFines = Number(totalFinesResult) || 0;

        // 5. Hồ sơ chờ duyệt
        const pendingBorrowOrders = await RentalOrder.count({ where: { status: 'Pending' } });
        const pendingTheses = await ThesisSubmission.count({ where: { status: 'pending' } });

        return {
            users: {
                total: totalUsers,
                activeCards,
                pendingCards,
                lockedCards,
                expiredCards,
            },
            books: {
                totalTitles: totalBooks,
                totalCopies: totalPhysicalCopies,
                availableCopies,
                rentingCopies,
                lostCopies,
            },
            digitalDocs: {
                totalDocs: totalDigitalDocs,
                totalTheses,
                totalPurchases,
                totalRevenue: totalDigitalDocRevenue,
            },
            rentals: {
                totalOrders,
                activeBorrowOrders,
                completedOrders,
                overdueOrders,
                totalFines,
            },
            pendingApprovals: {
                pendingCards,
                pendingBorrowOrders,
                pendingTheses,
                totalPending: pendingCards + pendingBorrowOrders + pendingTheses,
            },
        };
    }

    /**
     * 7.2. Lấy dữ liệu biểu đồ phân tích (Timeline mượn/trả, doanh thu, chuyên ngành, top sách)
     */
    async getChartsData({ timeRange = 'year' }) {
        // 1. Timeline 12 tháng gần nhất cho Mượn vs Trả & Doanh thu
        const months = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthLabel = `T${d.getMonth() + 1}/${d.getFullYear()}`;
            const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
            const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

            // Mượn
            const borrowCount = await RentalOrder.count({
                where: {
                    createdAt: { [Op.between]: [monthStart, monthEnd] },
                },
            });

            // Trả
            const returnCount = await RentalOrder.count({
                where: {
                    status: { [Op.in]: ['Returned', 'Completed'] },
                    updatedAt: { [Op.between]: [monthStart, monthEnd] },
                },
            });

            // Doanh thu tài liệu số
            const docRevenue = await DigitalDocPurchase.sum('amount', {
                where: {
                    status: 'completed',
                    createdAt: { [Op.between]: [monthStart, monthEnd] },
                },
            });

            // Tiền phạt
            const fineRevenue = await RentalItem.sum('penaltyFee', {
                where: {
                    status: 'Returned',
                    updatedAt: { [Op.between]: [monthStart, monthEnd] },
                },
            });

            months.push({
                month: monthLabel,
                borrowCount: borrowCount || 0,
                returnCount: returnCount || 0,
                docRevenue: Number(docRevenue) || 0,
                fineRevenue: Number(fineRevenue) || 0,
                totalRevenue: (Number(docRevenue) || 0) + (Number(fineRevenue) || 0),
            });
        }

        // 2. Phân bổ sách theo Thể loại / Chuyên ngành
        const categories = await Category.findAll({
            include: [{ model: Book, as: 'books', attributes: ['id'] }],
        });

        const categoryDistribution = categories.map((cat) => ({
            name: cat.name,
            bookCount: cat.books ? cat.books.length : 0,
        })).filter(c => c.bookCount > 0);

        // 3. Top 10 Sách được mượn nhiều nhất
        const allBooks = await Book.findAll({
            attributes: ['id', 'title', 'author', 'cover', 'rentCount', 'totalCopies', 'availableCopies'],
            order: [['rentCount', 'DESC']],
            limit: 10,
        });

        const topBorrowedBooks = allBooks.map((b, idx) => ({
            rank: idx + 1,
            id: b.id,
            title: b.title,
            author: b.author || 'Đang cập nhật',
            image: b.cover,
            rentalCount: b.rentCount || 0,
            totalCopies: b.totalCopies || 1,
            availableCopies: b.availableCopies || 0,
            turnoverRate: b.totalCopies > 0 ? Math.round(((b.rentCount || 0) / b.totalCopies) * 100) / 100 : 0,
        }));

        // 4. Danh sách các đầu sách ít / chưa được mượn (để tối ưu kho)
        const leastBorrowedBooks = await Book.findAll({
            attributes: ['id', 'title', 'author', 'cover', 'rentCount', 'totalCopies', 'availableCopies', 'createdAt'],
            order: [['rentCount', 'ASC'], ['createdAt', 'ASC']],
            limit: 10,
        });

        const formattedLeastBooks = leastBorrowedBooks.map(b => ({
            id: b.id,
            title: b.title,
            author: b.author || 'Đang cập nhật',
            image: b.cover,
            rentalCount: b.rentCount || 0,
            totalCopies: b.totalCopies || 0,
            availableCopies: b.availableCopies || 0,
            createdAt: b.createdAt,
        }));

        return {
            timeline: months,
            categoryDistribution,
            topBorrowedBooks,
            leastBorrowedBooks: formattedLeastBooks,
        };
    }

    /**
     * Dữ liệu phục vụ xuất báo cáo Excel đa Sheet
     */
    async getExportData() {
        const stats = await this.getOverviewStats();
        const charts = await this.getChartsData({ timeRange: 'year' });

        const allOrders = await RentalOrder.findAll({
            include: [{ model: RentalItem, as: 'items' }],
            limit: 100,
            order: [['createdAt', 'DESC']],
        });

        const allPurchases = await DigitalDocPurchase.findAll({
            include: [{ model: DigitalDocument, as: 'digitalDocument', attributes: ['title', 'docCode'] }],
            limit: 100,
            order: [['createdAt', 'DESC']],
        });

        return {
            stats,
            charts,
            recentOrders: allOrders.map(o => {
                const totalItemFines = (o.items || []).reduce((acc, it) => acc + (it.penaltyFee || 0), 0);
                return {
                    'Mã Phiếu': o.orderCode,
                    'Người Mượn': o.customerName,
                    'Số ĐT': o.phone,
                    'Trạng Thái': o.status,
                    'Hình Thức': o.borrowType === 'home' ? 'Về nhà' : 'Tại chỗ',
                    'Ngày Mượn': new Date(o.createdAt).toLocaleDateString('vi-VN'),
                    'Hạn Trả': o.dueDate,
                    'Tiền Cọc (VNĐ)': o.grandTotal,
                    'Tiền Phạt (VNĐ)': totalItemFines,
                };
            }),
            recentPurchases: allPurchases.map(p => ({
                'Mã Đơn': p.id,
                'Tên Tài Liệu': p.digitalDocument?.title || 'Tài liệu số',
                'Mã Số': p.digitalDocument?.docCode || '',
                'Số Tiền (VNĐ)': p.amount,
                'Phương Thức': p.paymentMethod,
                'Trạng Thái': p.status === 'completed' ? 'Hoàn tất' : 'Chờ',
                'Ngày Mua': new Date(p.createdAt).toLocaleDateString('vi-VN'),
            })),
            topBooks: charts.topBorrowedBooks.map(b => ({
                'Hạng': b.rank,
                'Tên Sách': b.title,
                'Tác Giả': b.author,
                'Tổng Lượt Mượn': b.rentalCount,
                'Số Bản Sao Trong Kho': b.totalCopies,
                'Hệ Số Luân Chuyển': b.turnoverRate,
            })),
            idleBooks: charts.leastBorrowedBooks.map(b => ({
                'Mã Sách': b.id,
                'Tên Sách': b.title,
                'Tác Giả': b.author,
                'Lượt Mượn': b.rentalCount || 0,
                'Số Lượng Tồn Kệ': b.availableCopies || b.totalCopies || 0,
            })),
        };
    }
}

module.exports = new DashboardService();
