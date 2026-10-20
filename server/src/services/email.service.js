const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config();

const {
    renderOtpTemplate,
    renderWelcomeTemplate,
    renderCardApprovalTemplate,
    renderBorrowApprovalTemplate,
    renderDueReminderTemplate,
    renderOverdueWarningTemplate,
    renderDigitalDocPurchaseTemplate,
    renderThesisReviewTemplate,
} = require('../utils/emailTemplates');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const EMAIL_USER = process.env.EMAIL_USER || 'ttluan113@gmail.com';

class EmailService {
    /**
     * Khởi tạo transporter gửi email (Google OAuth2 hoặc SMTP)
     */
    async getTransporter() {
        if (CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN) {
            try {
                const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
                oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
                const accessTokenRes = await oAuth2Client.getAccessToken();
                const accessToken = accessTokenRes?.token || accessTokenRes;

                return nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        type: 'OAuth2',
                        user: EMAIL_USER,
                        clientId: CLIENT_ID,
                        clientSecret: CLIENT_SECRET,
                        refreshToken: REFRESH_TOKEN,
                        accessToken: accessToken,
                    },
                });
            } catch (oauthErr) {
                console.warn('⚠️ [EmailService] Google OAuth2 token error, trying standard SMTP / JSON logger fallback:', oauthErr.message);
            }
        }

        // Fallback test transporter (console logger if credentials not available)
        return nodemailer.createTransport({
            jsonTransport: true,
        });
    }

    /**
     * Hàm gửi email chung
     */
    async sendMail({ to, subject, html, text }) {
        if (!to) {
            console.warn('⚠️ [EmailService] sendMail skipped: No destination email specified');
            return null;
        }

        try {
            const transporter = await this.getTransporter();
            const mailOptions = {
                from: `"Thư Viện Đại Học" <${EMAIL_USER}>`,
                to,
                subject,
                text: text || subject,
                html,
            };

            const info = await transporter.sendMail(mailOptions);
            console.log(`✉️ [EmailService] Sent email "${subject}" to ${to} (MessageId: ${info.messageId || 'json-logged'})`);
            return info;
        } catch (error) {
            console.error(`❌ [EmailService] Failed to send email to ${to}:`, error.message);
            return null;
        }
    }

    // 1. Gửi mã OTP
    async sendOtpEmail(email, { otp, type = 'forgot_password', fullName = 'Bạn đọc' }) {
        const isRegister = type === 'register';
        const subject = isRegister ? 'Mã xác thực đăng ký tài khoản Thư viện' : 'Mã xác thực đặt lại mật khẩu Thư viện';
        const html = renderOtpTemplate({ otp, type, fullName });
        return await this.sendMail({ to: email, subject, html, text: `Mã OTP của bạn là: ${otp}` });
    }

    // 2. Gửi thư chào mừng
    async sendWelcomeEmail(email, { fullName = 'Bạn đọc' }) {
        const subject = 'Chào mừng bạn đến với Cổng Thư Viện Đại Học!';
        const html = renderWelcomeTemplate({ fullName, email });
        return await this.sendMail({ to: email, subject, html });
    }

    // 3. Gửi thông báo duyệt thẻ thư viện
    async sendCardApprovalEmail(email, { fullName, memberCode, cardExpiryDate, maxBorrowLimit }) {
        const subject = `[Thư Viện] Thẻ Thư Viện (${memberCode}) của bạn đã được kích hoạt thành công`;
        const html = renderCardApprovalTemplate({ fullName, memberCode, cardExpiryDate, maxBorrowLimit });
        return await this.sendMail({ to: email, subject, html });
    }

    // 4. Gửi thông báo duyệt phiếu mượn sách
    async sendBorrowApprovalEmail(email, { fullName, orderCode, pickupDate, dueDate, items, borrowType }) {
        const subject = `[Thư Viện] Phiếu mượn sách ${orderCode} đã được phê duyệt & sẵn sàng nhận sách`;
        const html = renderBorrowApprovalTemplate({ fullName, orderCode, pickupDate, dueDate, items, borrowType });
        return await this.sendMail({ to: email, subject, html });
    }

    // 5. Gửi nhắc nhở hạn trả sách
    async sendDueReminderEmail(email, { fullName, orderCode, dueDate, daysLeft = 2, items }) {
        const subject = `[Nhắc Nhở] Sách mượn theo phiếu ${orderCode} sắp đến hạn hoàn trả (Còn ${daysLeft} ngày)`;
        const html = renderDueReminderTemplate({ fullName, orderCode, dueDate, daysLeft, items });
        return await this.sendMail({ to: email, subject, html });
    }

    // 6. Gửi cảnh báo sách quá hạn & tiền phạt
    async sendOverdueWarningEmail(email, { fullName, orderCode, dueDate, overdueDays = 3, fineAmount = 15000, items }) {
        const subject = `[Cảnh Báo Quá Hạn] Phiếu mượn ${orderCode} đã trễ hạn hoàn trả`;
        const html = renderOverdueWarningTemplate({ fullName, orderCode, dueDate, overdueDays, fineAmount, items });
        return await this.sendMail({ to: email, subject, html });
    }

    // 7. Gửi hóa đơn & mở khóa bản quyền tài liệu số
    async sendDigitalDocPurchaseEmail(email, { fullName, docTitle, docCode, amount, purchaseDate, downloadLink }) {
        const subject = `[Hóa Đơn] Mở khóa bản quyền tài liệu số "${docCode}" thành công`;
        const html = renderDigitalDocPurchaseTemplate({ fullName, docTitle, docCode, amount, purchaseDate, downloadLink });
        return await this.sendMail({ to: email, subject, html });
    }

    // 8. Gửi kết quả duyệt đồ án / luận văn nộp
    async sendThesisReviewEmail(email, { studentName, title, status = 'approved', docCode, rejectReason, publishedLink }) {
        const isApproved = status === 'approved';
        const subject = isApproved
            ? `[Thẩm Định Đồ Án] Đề tài "${title}" đã được phê duyệt lưu chiểu chính thức (${docCode})`
            : `[Thẩm Định Đồ Án] Yêu cầu chỉnh sửa bổ sung đề tài "${title}"`;
        const html = renderThesisReviewTemplate({ studentName, title, status, docCode, rejectReason, publishedLink });
        return await this.sendMail({ to: email, subject, html });
    }
}

module.exports = new EmailService();
