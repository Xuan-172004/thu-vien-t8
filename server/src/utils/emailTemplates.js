/**
 * Library Email Templates Generator
 * Standardized Responsive HTML Email Templates with Library Brand Palette
 */

const baseEmailWrapper = ({ title, preheader, content, actionBtn = null }) => {
    return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f6f5f2;
            margin: 0;
            padding: 0;
            color: #292524;
            line-height: 1.6;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f6f5f2;
            padding: 40px 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.06);
            border: 1px border #e7e5e4;
        }
        .header {
            background: linear-gradient(135deg, #1c1917 0%, #292524 50%, #44403c 100%);
            padding: 36px 30px;
            text-align: center;
            color: #ffffff;
        }
        .brand-badge {
            display: inline-block;
            background: rgba(217, 119, 6, 0.2);
            border: 1px solid rgba(245, 158, 11, 0.4);
            color: #fbbf24;
            padding: 4px 14px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
        }
        .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 900;
            letter-spacing: -0.5px;
            color: #ffffff;
        }
        .content {
            padding: 32px 30px;
            font-size: 14px;
            color: #44403c;
        }
        .info-card {
            background-color: #fafaf9;
            border: 1px solid #e7e5e4;
            border-radius: 16px;
            padding: 20px;
            margin: 20px 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f5f5f4;
            font-size: 13px;
        }
        .info-row:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }
        .info-label {
            color: #78716c;
            font-weight: 500;
        }
        .info-value {
            color: #1c1917;
            font-weight: 700;
            text-align: right;
        }
        .highlight-box {
            background-color: #fef3c7;
            border-left: 4px solid #d97706;
            padding: 16px;
            border-radius: 0 12px 12px 0;
            margin: 20px 0;
            font-size: 13px;
            color: #92400e;
        }
        .otp-code {
            font-family: 'Courier New', Courier, monospace;
            font-size: 32px;
            font-weight: 900;
            color: #b45309;
            letter-spacing: 8px;
            text-align: center;
            background: #fffbeb;
            border: 2px dashed #f59e0b;
            border-radius: 12px;
            padding: 16px;
            margin: 24px 0;
        }
        .btn-action {
            display: block;
            width: fit-content;
            margin: 28px auto 10px auto;
            background: #d97706;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 12px;
            font-weight: 800;
            font-size: 14px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3);
        }
        .footer {
            background-color: #f5f5f4;
            padding: 24px 30px;
            text-align: center;
            font-size: 12px;
            color: #a8a29e;
            border-top: 1px solid #e7e5e4;
        }
        .footer a {
            color: #78716c;
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <!-- Header -->
            <div class="header">
                <div class="brand-badge">THƯ VIỆN ĐẠI HỌC SỐ</div>
                <h1>${title}</h1>
            </div>

            <!-- Body Content -->
            <div class="content">
                ${content}
                ${actionBtn ? `<a href="${actionBtn.url}" class="btn-action">${actionBtn.label}</a>` : ''}
            </div>

            <!-- Footer -->
            <div class="footer">
                <p style="margin: 0 0 6px 0;"><strong>Hệ Thống Thư Viện Đại Học & Mượn Trả Trực Tuyến</strong></p>
                <p style="margin: 0 0 6px 0;">Địa chỉ: Tòa nhà Thư Viện Trung Tâm • Hotline: 1900 6868</p>
                <p style="margin: 0;">Email gửi tự động từ hệ thống, vui lòng không phản hồi trực tiếp thư này.</p>
            </div>
        </div>
    </div>
</body>
</html>
`;
};

// 1. Template OTP
const renderOtpTemplate = ({ otp, type = 'forgot_password', fullName = 'Bạn đọc' }) => {
    const isRegister = type === 'register';
    const title = isRegister ? 'Mã Xác Thực Đăng Ký Tài Khoản' : 'Mã Xác Thực Đặt Lại Mật Khẩu';
    const content = `
        <p>Xin chào <strong>${fullName}</strong>,</p>
        <p>Hệ thống nhận được yêu cầu ${isRegister ? 'đăng ký tài khoản mới' : 'đặt lại mật khẩu'} cho địa chỉ email này. Vui lòng sử dụng mã xác thực OTP 6 chữ số bên dưới để tiếp tục:</p>
        <div class="otp-code">${otp}</div>
        <div class="highlight-box">
            ⏱️ <strong>Lưu ý bảo mật:</strong> Mã OTP có hiệu lực trong vòng <strong>5 phút</strong>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai để đảm bảo an toàn tài khoản.
        </div>
        <p style="color: #78716c; font-size: 12px;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email hoặc liên hệ ngay với ban quản trị Thư viện.</p>
    `;
    return baseEmailWrapper({ title, content });
};

// 2. Template Welcome
const renderWelcomeTemplate = ({ fullName = 'Bạn đọc', email = '' }) => {
    const title = 'Chào Mừng Bạn Đến Với Thư Viện Số!';
    const content = `
        <p>Xin chào <strong>${fullName}</strong>,</p>
        <p>Chúc mừng bạn đã tạo tài khoản thành công tại Cổng Dịch Vụ Thư Viện Đại Học Trực Tuyến.</p>
        <div class="info-card">
            <div class="info-row">
                <span class="info-label">Tài khoản đăng nhập:</span>
                <span class="info-value">${email}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Trạng thái tài khoản:</span>
                <span class="info-value" style="color: #16a34a;">Đã Kích Hoạt</span>
            </div>
            <div class="info-row">
                <span class="info-label">Quyền lợi bạn đọc:</span>
                <span class="info-value">Tra cứu 10.000+ Sách & Luận văn</span>
            </div>
        </div>
        <p>Để bắt đầu mượn sách giấy về nhà và sử dụng phòng đọc, bạn hãy thực hiện <strong>Đăng ký cấp Thẻ Thư Viện</strong> trực tuyến ngay trên trang cá nhân.</p>
    `;
    return baseEmailWrapper({
        title,
        content,
        actionBtn: { label: 'Khám Phá Thư Viện Ngay', url: process.env.URL_CLIENT || 'http://localhost:5173' },
    });
};

// 3. Template Card Approval
const renderCardApprovalTemplate = ({
    fullName = 'Bạn đọc',
    memberCode = 'CARD-2026-0001',
    cardExpiryDate = '2027-12-31',
    maxBorrowLimit = 5,
}) => {
    const title = 'Thẻ Thư Viện Điện Tử Đã Được Kích Hoạt!';
    const content = `
        <p>Kính gửi bạn đọc <strong>${fullName}</strong>,</p>
        <p>Hồ sơ đăng ký Thẻ Thư Viện của bạn đã được Thủ thư tiếp nhận và phê duyệt thành công. Thông tin Thẻ điện tử của bạn như sau:</p>
        <div class="info-card">
            <div class="info-row">
                <span class="info-label">Mã thẻ thư viện:</span>
                <span class="info-value" style="color: #b45309; font-size: 15px;">${memberCode}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Họ và tên chủ thẻ:</span>
                <span class="info-value">${fullName}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Hạn sử dụng thẻ:</span>
                <span class="info-value">${new Date(cardExpiryDate).toLocaleDateString('vi-VN')}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Hạn mức mượn tối đa:</span>
                <span class="info-value">${maxBorrowLimit} cuốn sách cùng lúc</span>
            </div>
            <div class="info-row">
                <span class="info-label">Trạng thái thẻ:</span>
                <span class="info-value" style="color: #16a34a;">Hoạt động (Active)</span>
            </div>
        </div>
        <div class="highlight-box">
            💡 <strong>Hướng dẫn sử dụng:</strong> Bạn có thể xuất trình Mã Thẻ trên điện thoại khi đến mượn sách tại quầy, hoặc đặt mượn sách online giữ chỗ trước trên website.
        </div>
    `;
    return baseEmailWrapper({
        title,
        content,
        actionBtn: {
            label: 'Xem Thẻ Thư Viện Của Tôi',
            url: `${process.env.URL_CLIENT || 'http://localhost:5173'}/profile`,
        },
    });
};

// 4. Template Borrow Order Approval
const renderBorrowApprovalTemplate = ({
    fullName = 'Bạn đọc',
    orderCode = 'PM-2026-0001',
    pickupDate = 'Hôm nay',
    dueDate = '',
    items = [],
    borrowType = 'home',
}) => {
    const title = 'Phiếu Mượn Sách Đã Được Phê Duyệt';
    const itemsListHtml = items
        .map(
            (it, idx) => `
        <div class="info-row">
            <span class="info-label">${idx + 1}. ${it.title || it.bookTitle || 'Sách'}</span>
            <span class="info-value" style="font-family: monospace; color: #b45309;">${it.dkcbCode ? `ĐKCB: ${it.dkcbCode}` : 'Đã chuẩn bị'}</span>
        </div>`,
        )
        .join('');

    const content = `
        <p>Kính gửi <strong>${fullName}</strong>,</p>
        <p>Yêu cầu mượn sách trực tuyến mã số <strong>${orderCode}</strong> của bạn đã được Thủ thư duyệt và gán bản sao ĐKCB sẵn sàng tại quầy phục vụ.</p>
        
        <div class="info-card">
            <div class="info-row">
                <span class="info-label">Mã phiếu mượn:</span>
                <span class="info-value" style="color: #b45309;">${orderCode}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Hình thức mượn:</span>
                <span class="info-value">${borrowType === 'home' ? 'Mượn về nhà' : 'Đọc tại chỗ'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Thời hạn đến nhận sách:</span>
                <span class="info-value" style="color: #2563eb;">Trước 17:00 ngày ${pickupDate}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Hạn trả sách dự kiến:</span>
                <span class="info-value" style="color: #dc2626;">${dueDate}</span>
            </div>
            <div style="margin-top: 12px; font-weight: bold; font-size: 12px; color: #78716c; text-transform: uppercase;">Danh mục sách được cấp:</div>
            ${itemsListHtml}
        </div>

        <div class="highlight-box">
            📍 <strong>Địa điểm nhận sách:</strong> Quầy Thủ thư Tầng 1 - Thư viện Trung tâm. Vui lòng xuất trình Thẻ Thư Viện hoặc đọc Mã Phiếu Mượn khi nhận sách.
        </div>
    `;
    return baseEmailWrapper({
        title,
        content,
        actionBtn: {
            label: 'Xem Chi Tiết Phiếu Mượn',
            url: `${process.env.URL_CLIENT || 'http://localhost:5173'}/my-rentals`,
        },
    });
};

// 5. Template Due Reminder
const renderDueReminderTemplate = ({
    fullName = 'Bạn đọc',
    orderCode = 'PM-2026-0001',
    dueDate = '',
    daysLeft = 2,
    items = [],
}) => {
    const title = `Nhắc Nhở: Sách Mượn Sắp Đến Hạn Trả (Còn ${daysLeft} ngày)`;
    const itemsListHtml = items
        .map(
            (it, idx) => `
        <div class="info-row">
            <span class="info-label">${idx + 1}. ${it.title || it.bookTitle || 'Sách'}</span>
            <span class="info-value">${it.dkcbCode || ''}</span>
        </div>`,
        )
        .join('');

    const content = `
        <p>Kính gửi <strong>${fullName}</strong>,</p>
        <p>Hệ thống Thư viện xin nhắc bạn về phiếu mượn sách <strong>${orderCode}</strong> sắp đến hạn hoàn trả:</p>
        <div class="info-card">
            <div class="info-row">
                <span class="info-label">Mã phiếu mượn:</span>
                <span class="info-value">${orderCode}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Ngày đến hạn trả:</span>
                <span class="info-value" style="color: #dc2626; font-size: 15px;">${dueDate}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Thời gian còn lại:</span>
                <span class="info-value" style="color: #d97706;">${daysLeft} ngày</span>
            </div>
            <div style="margin-top: 12px; font-weight: bold; font-size: 12px; color: #78716c; text-transform: uppercase;">Danh sách sách đang mượn:</div>
            ${itemsListHtml}
        </div>
        <p>Nếu bạn vẫn có nhu cầu đọc tiếp, bạn có thể thực hiện <strong>Gia hạn trực tuyến</strong> trên website nếu chưa vượt quá số lần gia hạn cho phép.</p>
    `;
    return baseEmailWrapper({
        title,
        content,
        actionBtn: {
            label: 'Gia Hạn / Kiểm Tra Sổ Mượn',
            url: `${process.env.URL_CLIENT || 'http://localhost:5173'}/my-rentals`,
        },
    });
};

// 6. Template Overdue Warning
const renderOverdueWarningTemplate = ({
    fullName = 'Bạn đọc',
    orderCode = 'PM-2026-0001',
    dueDate = '',
    overdueDays = 3,
    fineAmount = 15000,
    items = [],
}) => {
    const title = 'Cảnh Báo: Phiếu Mượn Sách Đã Quá Hạn Hoàn Trả';
    const itemsListHtml = items
        .map(
            (it, idx) => `
        <div class="info-row">
            <span class="info-label">${idx + 1}. ${it.title || it.bookTitle || 'Sách'}</span>
            <span class="info-value">${it.dkcbCode || ''}</span>
        </div>`,
        )
        .join('');

    const content = `
        <p>Kính gửi bạn đọc <strong>${fullName}</strong>,</p>
        <p>Hệ thống ghi nhận phiếu mượn <strong>${orderCode}</strong> của bạn đã <strong>QUÁ HẠN</strong> hoàn trả theo quy định của Thư viện:</p>
        <div class="info-card" style="border-color: #fca5a5; background-color: #fef2f2;">
            <div class="info-row">
                <span class="info-label">Mã phiếu mượn:</span>
                <span class="info-value">${orderCode}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Hạn trả quy định:</span>
                <span class="info-value" style="color: #dc2626;">${dueDate}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Số ngày trễ hạn:</span>
                <span class="info-value" style="color: #b91c1c; font-size: 15px;">${overdueDays} ngày</span>
            </div>
            <div class="info-row">
                <span class="info-label">Phí phạt quá hạn tạm tính:</span>
                <span class="info-value" style="color: #b91c1c; font-size: 16px;">${Number(fineAmount).toLocaleString('vi-VN')} VNĐ</span>
            </div>
            <div style="margin-top: 12px; font-weight: bold; font-size: 12px; color: #78716c; text-transform: uppercase;">Sách cần hoàn trả:</div>
            ${itemsListHtml}
        </div>
        <div class="highlight-box" style="background-color: #fee2e2; border-left-color: #dc2626; color: #991b1b;">
            ⚠️ <strong>Yêu cầu xử lý gấp:</strong> Vui lòng mang sách đến quầy Thư viện để hoàn tất thủ tục trả sách và nộp phạt. Tài khoản quá hạn quá 30 ngày sẽ bị tạm khóa quyền mượn sách.
        </div>
    `;
    return baseEmailWrapper({
        title,
        content,
        actionBtn: {
            label: 'Xem Chi Tiết Phiếu Quá Hạn',
            url: `${process.env.URL_CLIENT || 'http://localhost:5173'}/my-rentals`,
        },
    });
};

// 7. Template Digital Doc Purchase Invoice
const renderDigitalDocPurchaseTemplate = ({
    fullName = 'Bạn đọc',
    docTitle = 'Tài liệu số',
    docCode = 'DOC-2026',
    amount = 0,
    purchaseDate = new Date().toLocaleDateString('vi-VN'),
    downloadLink = '',
}) => {
    const title = 'Hóa Đơn & Mở Khóa Bản Quyền Tài Liệu Số';
    const content = `
        <p>Kính gửi <strong>${fullName}</strong>,</p>
        <p>Cảm ơn bạn đã đăng ký mua bản quyền tài liệu số tại Thư viện điện tử. Giao dịch của bạn đã hoàn tất thành công:</p>
        <div class="info-card">
            <div class="info-row">
                <span class="info-label">Tên tài liệu:</span>
                <span class="info-value" style="color: #1c1917; max-width: 300px;">${docTitle}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Mã tài liệu:</span>
                <span class="info-value" style="font-family: monospace; color: #b45309;">${docCode}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Ngày giao dịch:</span>
                <span class="info-value">${purchaseDate}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Số tiền thanh toán:</span>
                <span class="info-value" style="color: #16a34a; font-size: 15px;">${Number(amount) > 0 ? `${Number(amount).toLocaleString('vi-VN')} VNĐ` : 'Miễn Phí'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Quyền truy cập:</span>
                <span class="info-value" style="color: #16a34a;">Vĩnh viễn (Đọc 100% & Tải PDF)</span>
            </div>
        </div>
        <p>Bạn có thể truy cập kho tài liệu số của mình bất kỳ lúc nào để đọc trực tuyến hoặc tải file PDF gốc về thiết bị.</p>
    `;
    return baseEmailWrapper({
        title,
        content,
        actionBtn: {
            label: 'Đọc & Tải File PDF Toàn Văn',
            url: downloadLink || `${process.env.URL_CLIENT || 'http://localhost:5173'}/digital-docs`,
        },
    });
};

// 8. Template Thesis Review Result
const renderThesisReviewTemplate = ({
    studentName = 'Sinh viên',
    title: thesisTitle = 'Đề tài tốt nghiệp',
    status = 'approved',
    docCode = 'THESIS-2026-001',
    rejectReason = '',
    publishedLink = '',
}) => {
    const isApproved = status === 'approved';
    const title = isApproved
        ? 'Thông Báo: Đồ Án Tốt Nghiệp Đã Được Phê Duyệt Lưu Chiểu!'
        : 'Thông Báo: Yêu Cầu Chỉnh Sửa Hồ Sơ Đồ Án / Luận Văn';

    const content = isApproved
        ? `
        <p>Kính gửi sinh viên / tác giả <strong>${studentName}</strong>,</p>
        <p>Hội đồng Thẩm định & Ban Quản trị Thư viện trân trọng thông báo: Hồ sơ đề tài tốt nghiệp của bạn đã được <strong>PHÊ DUYỆT LƯU CHIỂU CHÍNH THỨC</strong> vào Kho tri thức số của Nhà trường.</p>
        <div class="info-card">
            <div class="info-row">
                <span class="info-label">Tên đề tài:</span>
                <span class="info-value" style="max-width: 320px;">${thesisTitle}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Tác giả thực hiện:</span>
                <span class="info-value">${studentName}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Mã số lưu chiểu quốc gia:</span>
                <span class="info-value" style="color: #b45309; font-size: 15px; font-family: monospace;">${docCode}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Trạng thái xuất bản:</span>
                <span class="info-value" style="color: #16a34a;">Đã Xuất Bản Công Khai</span>
            </div>
        </div>
        <p>Cảm ơn những đóng góp học thuật quý báu của bạn cho cộng đồng nghiên cứu của Nhà trường!</p>
    `
        : `
        <p>Kính gửi sinh viên / tác giả <strong>${studentName}</strong>,</p>
        <p>Sau khi kiểm tra thể thức và hồ sơ nộp đề tài <strong>"${thesisTitle}"</strong>, Thủ thư yêu cầu bạn thực hiện chỉnh sửa bổ sung với nội dung sau:</p>
        <div class="highlight-box" style="background-color: #fff7ed; border-left-color: #ea580c; color: #9a3412;">
            📝 <strong>Nội dung phản hồi từ Thủ thư:</strong><br />
            ${rejectReason || 'Vui lòng bổ sung đầy đủ chữ ký của GVHD và kiểm tra lại mục lục.'}
        </div>
        <p>Vui lòng cập nhật lại file PDF hoặc thông tin đề tài và bấm <strong>"Chỉnh Sửa & Nộp Lại"</strong> trên hệ thống để được thẩm định lại.</p>
    `;

    return baseEmailWrapper({
        title,
        content,
        actionBtn: {
            label: isApproved ? 'Xem Đồ Án Trên Kho Số' : 'Chỉnh Sửa & Nộp Lại Hồ Sơ',
            url: isApproved
                ? publishedLink || `${process.env.URL_CLIENT || 'http://localhost:5173'}/digital-docs`
                : `${process.env.URL_CLIENT || 'http://localhost:5173'}/submit-thesis`,
        },
    });
};

module.exports = {
    renderOtpTemplate,
    renderWelcomeTemplate,
    renderCardApprovalTemplate,
    renderBorrowApprovalTemplate,
    renderDueReminderTemplate,
    renderOverdueWarningTemplate,
    renderDigitalDocPurchaseTemplate,
    renderThesisReviewTemplate,
};