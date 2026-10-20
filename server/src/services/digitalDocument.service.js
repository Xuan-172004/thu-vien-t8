const { DigitalDocument } = require('../models');
const { Op } = require('sequelize');

const mockDigitalDocs = [
    {
        id: 1,
        docCode: 'THESIS-2026-001',
        title: 'Nghiên cứu & Phân tích Hệ thống Quản lý Thư viện Thông minh tích hợp AI',
        author: 'Nguyễn Văn Anh (SV20220101)',
        advisor: 'TS. Lê Thanh Hải',
        category: 'CNTT',
        documentType: 'thesis',
        publishYear: 2026,
        pages: 85,
        fileSize: '4.8 MB',
        pdfFile: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        previewPages: 5,
        coverImage: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80',
        description: 'Đồ án tốt nghiệp chuyên ngành Hệ thống Thông tin - Xây dựng giải pháp quản lý mượn trả tự động hóa.',
        price: 50000,
        isForSale: true,
        status: 'active',
        viewCount: 142,
        downloadCount: 38,
    },
    {
        id: 2,
        docCode: 'THESIS-2026-002',
        title: 'Thiết kế Hệ thống Điện toán Đám mây ứng dụng Vi Dịch vụ (Microservices)',
        author: 'Trần Thị Bình (SV20220215)',
        advisor: 'PGS.TS. Phạm Hoàng Nam',
        category: 'CNTT',
        documentType: 'thesis',
        publishYear: 2025,
        pages: 110,
        fileSize: '6.2 MB',
        pdfFile: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        previewPages: 5,
        coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
        description: 'Luận văn tốt nghiệp thạc sĩ công nghệ phần mềm - Kiến trúc và triển khai Microservices trên Kubernetes.',
        price: 75000,
        isForSale: true,
        status: 'active',
        viewCount: 210,
        downloadCount: 56,
    },
    {
        id: 3,
        docCode: 'EBOOK-2026-101',
        title: 'Giáo trình Cấu trúc Dữ liệu & Giải thuật Nâng cao',
        author: 'Bộ môn Khoa học Máy tính',
        advisor: 'Khoa CNTT',
        category: 'CNTT',
        documentType: 'ebook',
        publishYear: 2024,
        pages: 240,
        fileSize: '12.5 MB',
        pdfFile: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        previewPages: 10,
        coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80',
        description: 'Tài liệu học tập chính thức môn Cấu trúc dữ liệu và Giải thuật dùng cho sinh viên đại học.',
        price: 0,
        isForSale: true,
        status: 'active',
        viewCount: 520,
        downloadCount: 180,
    },
];

class DigitalDocumentService {
    static async getAllAdmin({ search = '', category = '', documentType = '', status = '', page = 1, limit = 20 }) {
        try {
            const where = {};
            if (search) {
                where[Op.or] = [
                    { docCode: { [Op.like]: `%${search}%` } },
                    { title: { [Op.like]: `%${search}%` } },
                    { author: { [Op.like]: `%${search}%` } },
                    { advisor: { [Op.like]: `%${search}%` } },
                ];
            }
            if (category && category !== 'all') {
                where.category = category;
            }
            if (documentType && documentType !== 'all') {
                where.documentType = documentType;
            }
            if (status && status !== 'all') {
                where.status = status;
            }

            const { count, rows } = await DigitalDocument.findAndCountAll({
                where,
                order: [['createdAt', 'DESC']],
                limit: Number(limit),
                offset: (Number(page) - 1) * Number(limit),
            });

            if (count === 0 && !search && (!category || category === 'all')) {
                // Seed mock items if empty
                await DigitalDocument.bulkCreate(mockDigitalDocs);
                return this.getAllAdmin({ search, category, documentType, status, page, limit });
            }

            return {
                total: count,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(count / limit),
                docs: rows,
            };
        } catch (error) {
            console.warn('DigitalDocument DB query error, fallback to mock data:', error.message);
            let filtered = [...mockDigitalDocs];
            if (search) {
                const s = search.toLowerCase();
                filtered = filtered.filter(
                    d => d.title.toLowerCase().includes(s) || d.docCode.toLowerCase().includes(s) || d.author.toLowerCase().includes(s)
                );
            }
            if (documentType && documentType !== 'all') {
                filtered = filtered.filter(d => d.documentType === documentType);
            }
            if (status && status !== 'all') {
                filtered = filtered.filter(d => d.status === status);
            }
            return {
                total: filtered.length,
                page: 1,
                limit: Number(limit),
                totalPages: 1,
                docs: filtered,
            };
        }
    }

    static async createAdmin(data) {
        const docCode = data.docCode || `DOC-${Date.now().toString().slice(-6)}`;
        const newDoc = await DigitalDocument.create({
            ...data,
            docCode,
        });
        return newDoc;
    }

    static async updateAdmin(id, data) {
        const doc = await DigitalDocument.findByPk(id);
        if (!doc) {
            throw new Error('Không tìm thấy tài liệu số!');
        }
        await doc.update(data);
        return doc;
    }

    static async deleteAdmin(id) {
        const doc = await DigitalDocument.findByPk(id);
        if (!doc) {
            throw new Error('Không tìm thấy tài liệu số!');
        }
        await doc.destroy();
        return true;
    }

    static async toggleStatusAdmin(id) {
        const doc = await DigitalDocument.findByPk(id);
        if (!doc) {
            throw new Error('Không tìm thấy tài liệu số!');
        }
        doc.status = doc.status === 'active' ? 'hidden' : 'active';
        await doc.save();
        return doc;
    }

    static async getAllPublic(params) {
        return this.getAllAdmin({ ...params, status: 'active' });
    }

    static async getDetailPublic(id) {
        let doc = await DigitalDocument.findByPk(id).catch(() => null);
        if (!doc) {
            doc = mockDigitalDocs.find(d => String(d.id) === String(id));
        }
        if (!doc) {
            throw new Error('Không tìm thấy tài liệu số!');
        }
        return doc;
    }

    static async checkOwnership(userId, digitalDocId) {
        const { User, DigitalDocPurchase } = require('../models');
        if (!userId) return { isOwned: false };

        const purchase = await DigitalDocPurchase.findOne({
            where: { userId, digitalDocId, status: 'completed' },
        }).catch(() => null);

        if (purchase) {
            return { isOwned: true, purchase };
        }
        return { isOwned: false };
    }

    static async purchaseDigitalDoc(userId, digitalDocId, paymentMethod = 'wallet') {
        const { User, DigitalDocument, DigitalDocPurchase } = require('../models');

        const user = await User.findByPk(userId);
        if (!user) {
            throw new Error('Không tìm thấy thông tin tài khoản!');
        }

        let doc = await DigitalDocument.findByPk(digitalDocId).catch(() => null);
        if (!doc) {
            doc = mockDigitalDocs.find(d => String(d.id) === String(digitalDocId));
        }
        if (!doc) {
            throw new Error('Không tìm thấy tài liệu số!');
        }

        // Check if already owned
        const existing = await DigitalDocPurchase.findOne({
            where: { userId, digitalDocId, status: 'completed' },
        }).catch(() => null);

        if (existing) {
            return {
                isOwned: true,
                message: 'Bạn đã sở hữu bản quyền tài liệu này từ trước!',
                purchase: existing,
                userWalletBalance: user.walletBalance,
            };
        }

        const price = Number(doc.price) || 0;

        if (price > 0 && paymentMethod === 'wallet') {
            if ((user.walletBalance || 0) < price) {
                throw new Error(`Số dư ví cọc không đủ (${(user.walletBalance || 0).toLocaleString()}đ). Cần ${price.toLocaleString()}đ để mua bản quyền tài liệu này. Vui lòng nạp thêm ví!`);
            }

            // Deduct wallet balance
            user.walletBalance = Math.max(0, (user.walletBalance || 0) - price);
            await user.save();
        }

        // Create purchase record
        const purchase = await DigitalDocPurchase.create({
            userId,
            digitalDocId,
            docCode: doc.docCode,
            docTitle: doc.title,
            amount: price,
            paymentMethod: price === 0 ? 'free' : paymentMethod,
            status: 'completed',
        }).catch(() => ({
            id: Date.now(),
            userId,
            digitalDocId,
            docCode: doc.docCode,
            docTitle: doc.title,
            amount: price,
            status: 'completed',
        }));

        // Increment stats if real DB record
        if (typeof doc.increment === 'function') {
            await doc.increment('downloadCount', { by: 1 }).catch(() => null);
        }

        // Push real-time notification to user
        const notificationService = require('./notification.service');
        await notificationService.createNotification({
            userId,
            title: 'Mở Khóa Bản Quyền Tài Liệu Thành Công!',
            message: `Bạn đã mở khóa 100% bản quyền tài liệu "${doc.title}". Đã kích hoạt quyền đọc không giới hạn và tải file PDF gốc.`,
            type: 'success',
            category: 'purchase',
            link: `/digital-docs/${doc.id}`,
        });

        // Send Transactional Invoice Email
        if (user.email) {
            const emailService = require('./email.service');
            emailService.sendDigitalDocPurchaseEmail(user.email, {
                fullName: user.fullName || 'Bạn đọc',
                docTitle: doc.title,
                docCode: doc.docCode,
                amount: price,
                purchaseDate: new Date().toLocaleDateString('vi-VN'),
                downloadLink: `${process.env.URL_CLIENT || 'http://localhost:5173'}/digital-docs/${doc.id}`,
            }).catch(err => console.warn('Purchase email error:', err.message));
        }

        return {
            isOwned: true,
            message: 'Mua bản quyền tài liệu số thành công! Đã mở khóa 100% tất cả các trang.',
            purchase,
            userWalletBalance: user.walletBalance,
        };
    }

    static async getMyPurchasedDocs(userId) {
        const { DigitalDocPurchase, DigitalDocument } = require('../models');
        try {
            const purchases = await DigitalDocPurchase.findAll({
                where: { userId, status: 'completed' },
                include: [{ model: DigitalDocument, as: 'digitalDocument' }],
                order: [['createdAt', 'DESC']],
            });
            return purchases;
        } catch (err) {
            return [];
        }
    }
}

module.exports = DigitalDocumentService;
