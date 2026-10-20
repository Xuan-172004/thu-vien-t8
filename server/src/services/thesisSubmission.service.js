const { ThesisSubmission, DigitalDocument, User } = require('../models');
const { Op } = require('sequelize');
const { BadRequestError, NotFoundError } = require('../core/error.response');
const notificationService = require('./notification.service');

class ThesisSubmissionService {
    /**
     * Sinh viên nộp đồ án / luận văn lưu chiểu
     */
    async submitThesis(userId, data) {
        if (!data.title || !data.advisor || !data.pdfFile || !data.abstract) {
            throw new BadRequestError('Vui lòng điền đầy đủ tiêu đề, GVHD, file PDF và tóm tắt đề tài!');
        }

        const user = await User.findByPk(userId);
        const studentName = data.studentName || user?.fullName || 'Sinh viên';
        const studentId = data.studentId || user?.studentId || user?.cccd || 'SV-2026';

        const submission = await ThesisSubmission.create({
            userId,
            studentName,
            studentId,
            faculty: data.faculty || 'CNTT',
            major: data.major || 'Kỹ thuật phần mềm',
            title: data.title.trim(),
            author: data.author || studentName,
            coAuthors: data.coAuthors || '',
            advisor: data.advisor.trim(),
            thesisType: data.thesisType || 'bachelor',
            defenseYear: parseInt(data.defenseYear) || new Date().getFullYear(),
            pages: parseInt(data.pages) || 80,
            fileSize: data.fileSize || '5.0 MB',
            pdfFile: data.pdfFile,
            coverImage: data.coverImage || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80',
            abstract: data.abstract.trim(),
            keywords: data.keywords || '',
            status: 'pending',
        });

        // Push real-time notification to Admins
        await notificationService.createNotification({
            title: 'Hồ sơ đồ án nộp mới',
            message: `Sinh viên ${submission.studentName} (${submission.studentId}) vừa nộp đề tài: "${submission.title}".`,
            type: 'info',
            category: 'thesis_approval',
            link: '/admin/digital-docs',
            sendToAdmin: true,
        });

        return submission;
    }

    /**
     * Sinh viên xem danh sách đồ án mình đã nộp
     */
    async getMySubmissions(userId) {
        const list = await ThesisSubmission.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            include: [{
                model: DigitalDocument,
                as: 'digitalDocument',
                attributes: ['id', 'docCode', 'title', 'price', 'viewCount', 'downloadCount'],
            }],
        });
        return list;
    }

    /**
     * Thủ thư / Admin xem toàn bộ hồ sơ nộp kèm bộ lọc
     */
    async getAllSubmissionsAdmin(queryParams = {}) {
        const { status, search, faculty, thesisType, page = 1, limit = 20 } = queryParams;

        const where = {};
        if (status && status !== 'all') {
            where.status = status;
        }
        if (faculty && faculty !== 'all') {
            where.faculty = faculty;
        }
        if (thesisType && thesisType !== 'all') {
            where.thesisType = thesisType;
        }
        if (search && search.trim()) {
            const q = search.trim();
            where[Op.or] = [
                { title: { [Op.like]: `%${q}%` } },
                { studentName: { [Op.like]: `%${q}%` } },
                { studentId: { [Op.like]: `%${q}%` } },
                { advisor: { [Op.like]: `%${q}%` } },
            ];
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { rows, count } = await ThesisSubmission.findAndCountAll({
            where,
            order: [
                ['status', 'ASC'], // 'pending' first
                ['createdAt', 'DESC'],
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'fullName', 'email', 'phone', 'avatar'],
                },
                {
                    model: DigitalDocument,
                    as: 'digitalDocument',
                    attributes: ['id', 'docCode', 'title', 'price'],
                },
            ],
        });

        return {
            submissions: rows,
            totalItems: count,
            totalPages: Math.ceil(count / parseInt(limit)) || 1,
            currentPage: parseInt(page),
        };
    }

    /**
     * Xem chi tiết 1 hồ sơ nộp
     */
    async getSubmissionDetail(id) {
        const sub = await ThesisSubmission.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'fullName', 'email', 'phone', 'avatar'],
                },
                {
                    model: DigitalDocument,
                    as: 'digitalDocument',
                },
            ],
        });
        if (!sub) throw new NotFoundError('Không tìm thấy hồ sơ đồ án nộp!');
        return sub;
    }

    /**
     * Thủ thư Duyệt hồ sơ & Tự động xuất bản lên Kho tài liệu số
     */
    async approveSubmission(id, reviewerUser, approvalConfig = {}) {
        const sub = await ThesisSubmission.findByPk(id);
        if (!sub) throw new NotFoundError('Không tìm thấy hồ sơ đồ án nộp!');
        if (sub.status === 'approved') throw new BadRequestError('Hồ sơ đồ án này đã được phê duyệt trước đó!');

        // Generate unique docCode e.g. THESIS-2026-892
        const randomNum = Math.floor(100 + Math.random() * 900);
        const prefix = sub.thesisType === 'master' ? 'MASTER' : sub.thesisType === 'doctoral' ? 'DISSERTATION' : 'THESIS';
        const generatedCode = approvalConfig.customDocCode || `${prefix}-${sub.defenseYear || 2026}-${randomNum}`;

        // Map documentType
        const docType = sub.thesisType === 'doctoral' ? 'dissertation' : 'thesis';

        // Create DigitalDocument in library portal
        const digitalDoc = await DigitalDocument.create({
            docCode: generatedCode,
            title: sub.title,
            author: `${sub.studentName} (MSSV: ${sub.studentId})`,
            advisor: sub.advisor,
            category: approvalConfig.category || sub.faculty || 'CNTT',
            documentType: docType,
            publishYear: sub.defenseYear || 2026,
            pages: sub.pages || 80,
            fileSize: sub.fileSize || '5.0 MB',
            pdfFile: sub.pdfFile,
            previewPages: parseInt(approvalConfig.previewPages) || 5,
            coverImage: sub.coverImage || 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80',
            description: sub.abstract,
            price: parseFloat(approvalConfig.price) || 0,
            isForSale: parseFloat(approvalConfig.price) > 0,
            status: 'active',
            viewCount: 0,
            downloadCount: 0,
        });

        // Update ThesisSubmission status
        await sub.update({
            status: 'approved',
            reviewedBy: reviewerUser?.fullName || reviewerUser?.email || 'Thủ thư Trưởng',
            reviewedAt: new Date(),
            rejectReason: null,
            digitalDocId: digitalDoc.id,
        });

        // Push real-time notification to student
        if (sub.userId) {
            await notificationService.createNotification({
                userId: sub.userId,
                title: 'Đồ Án Tốt Nghiệp Đã Được Phê Duyệt Lưu Chiểu!',
                message: `Đề tài "${sub.title}" của bạn đã được Thủ thư phê duyệt chính thức với mã số lưu chiểu ${digitalDoc.docCode} và đã xuất bản lên Kho tài liệu số.`,
                type: 'success',
                category: 'thesis_approval',
                link: `/digital-docs/${digitalDoc.id}`,
            });

            // Send Transactional Email
            const studentUser = await User.findByPk(sub.userId).catch(() => null);
            if (studentUser?.email) {
                const emailService = require('./email.service');
                emailService.sendThesisReviewEmail(studentUser.email, {
                    studentName: sub.studentName || studentUser.fullName || 'Sinh viên',
                    title: sub.title,
                    status: 'approved',
                    docCode: digitalDoc.docCode,
                    publishedLink: `${process.env.URL_CLIENT || 'http://localhost:5173'}/digital-docs/${digitalDoc.id}`,
                }).catch(err => console.warn('Thesis approval email error:', err.message));
            }
        }

        return {
            submission: sub,
            publishedDocument: digitalDoc,
        };
    }

    /**
     * Thủ thư Từ chối / Yêu cầu sinh viên chỉnh sửa
     */
    async rejectSubmission(id, reviewerUser, { rejectReason }) {
        if (!rejectReason || !rejectReason.trim()) {
            throw new BadRequestError('Vui lòng nhập lý do từ chối hoặc nội dung yêu cầu sinh viên chỉnh sửa!');
        }

        const sub = await ThesisSubmission.findByPk(id);
        if (!sub) throw new NotFoundError('Không tìm thấy hồ sơ đồ án nộp!');

        await sub.update({
            status: 'rejected',
            rejectReason: rejectReason.trim(),
            reviewedBy: reviewerUser?.fullName || reviewerUser?.email || 'Thủ thư Trưởng',
            reviewedAt: new Date(),
        });

        // Push real-time notification to student
        if (sub.userId) {
            await notificationService.createNotification({
                userId: sub.userId,
                title: 'Yêu Cầu Chỉnh Sửa Hồ Sơ Đồ Án',
                message: `Hồ sơ đề tài "${sub.title}" cần chỉnh sửa bổ sung. Lý do: ${rejectReason.trim()}`,
                type: 'warning',
                category: 'thesis_approval',
                link: '/submit-thesis',
            });

            // Send Transactional Email
            const studentUser = await User.findByPk(sub.userId).catch(() => null);
            if (studentUser?.email) {
                const emailService = require('./email.service');
                emailService.sendThesisReviewEmail(studentUser.email, {
                    studentName: sub.studentName || studentUser.fullName || 'Sinh viên',
                    title: sub.title,
                    status: 'rejected',
                    rejectReason: rejectReason.trim(),
                }).catch(err => console.warn('Thesis rejection email error:', err.message));
            }
        }

        return sub;
    }

    /**
     * Sinh viên cập nhật lại hồ sơ bị từ chối và nộp lại
     */
    async resubmitThesis(id, userId, updateData) {
        const sub = await ThesisSubmission.findOne({ where: { id, userId } });
        if (!sub) throw new NotFoundError('Không tìm thấy hồ sơ đồ án của bạn!');
        if (sub.status === 'approved') throw new BadRequestError('Đồ án đã được duyệt xuất bản, không thể chỉnh sửa!');

        await sub.update({
            ...updateData,
            status: 'pending',
            rejectReason: null,
        });

        return sub;
    }
}

module.exports = new ThesisSubmissionService();
