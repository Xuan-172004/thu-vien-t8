const emailService = require('../services/email.service');

class EmailController {
    /**
     * Gửi email thử nghiệm (Test Demo cho từng mẫu trong 8 mẫu)
     */
    async sendTestEmail(req, res) {
        const { templateType, targetEmail, customData } = req.body;
        const recipient = targetEmail || req.user?.email || 'ttluan113@gmail.com';
        const userFullName = req.user?.fullName || 'Bạn đọc Thư viện';

        let result = null;

        switch (templateType) {
            case 'otp_register':
                result = await emailService.sendOtpEmail(recipient, {
                    otp: '839210',
                    type: 'register',
                    fullName: userFullName,
                });
                break;

            case 'otp_forgot':
                result = await emailService.sendOtpEmail(recipient, {
                    otp: '492015',
                    type: 'forgot_password',
                    fullName: userFullName,
                });
                break;

            case 'welcome':
                result = await emailService.sendWelcomeEmail(recipient, {
                    fullName: userFullName,
                    email: recipient,
                });
                break;

            case 'card_approval':
                result = await emailService.sendCardApprovalEmail(recipient, {
                    fullName: userFullName,
                    memberCode: `CARD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
                    cardExpiryDate: '2027-12-31',
                    maxBorrowLimit: 5,
                });
                break;

            case 'borrow_approval':
                result = await emailService.sendBorrowApprovalEmail(recipient, {
                    fullName: userFullName,
                    orderCode: `PM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                    pickupDate: new Date().toLocaleDateString('vi-VN'),
                    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
                    items: [
                        { title: 'Nhập môn Trí tuệ Nhân tạo & Deep Learning', dkcbCode: 'AI-2026-001' },
                        { title: 'Thiết kế Kiến trúc Microservices', dkcbCode: 'SE-2026-042' },
                    ],
                    borrowType: 'home',
                });
                break;

            case 'due_reminder':
                result = await emailService.sendDueReminderEmail(recipient, {
                    fullName: userFullName,
                    orderCode: `PM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
                    daysLeft: 2,
                    items: [
                        { title: 'Nhập môn Trí tuệ Nhân tạo & Deep Learning', dkcbCode: 'AI-2026-001' },
                    ],
                });
                break;

            case 'overdue_warning':
                result = await emailService.sendOverdueWarningEmail(recipient, {
                    fullName: userFullName,
                    orderCode: `PM-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'),
                    overdueDays: 3,
                    fineAmount: 15000,
                    items: [
                        { title: 'Nhập môn Trí tuệ Nhân tạo & Deep Learning', dkcbCode: 'AI-2026-001' },
                    ],
                });
                break;

            case 'digital_doc_purchase':
                result = await emailService.sendDigitalDocPurchaseEmail(recipient, {
                    fullName: userFullName,
                    docTitle: 'Nghiên Cứu Hệ Thống Phân Tán Trên Nền Tảng Cloud Native',
                    docCode: 'DOC-2026-888',
                    amount: 50000,
                    purchaseDate: new Date().toLocaleDateString('vi-VN'),
                    downloadLink: `${process.env.URL_CLIENT || 'http://localhost:5173'}/digital-docs`,
                });
                break;

            case 'thesis_approval':
                result = await emailService.sendThesisReviewEmail(recipient, {
                    studentName: userFullName,
                    title: 'Xây Dựng Hệ Thống Quản Lý Thư Viện Đại Học 4.0 Dựa Trên Nền Tảng AI',
                    status: 'approved',
                    docCode: 'THESIS-2026-999',
                    publishedLink: `${process.env.URL_CLIENT || 'http://localhost:5173'}/digital-docs`,
                });
                break;

            case 'thesis_reject':
                result = await emailService.sendThesisReviewEmail(recipient, {
                    studentName: userFullName,
                    title: 'Xây Dựng Hệ Thống Quản Lý Thư Viện Đại Học 4.0 Dựa Trên Nền Tảng AI',
                    status: 'rejected',
                    rejectReason: 'File PDF chưa có chữ ký xác nhận của Giảng viên hướng dẫn và trang bìa cần theo chuẩn mẫu quy định.',
                });
                break;

            default:
                result = await emailService.sendWelcomeEmail(recipient, {
                    fullName: userFullName,
                    email: recipient,
                });
        }

        return res.status(200).json({
            success: true,
            message: `Đã phát lệnh gửi Email mẫu "${templateType}" tới địa chỉ ${recipient} thành công!`,
            metadata: result,
        });
    }
}

module.exports = new EmailController();
