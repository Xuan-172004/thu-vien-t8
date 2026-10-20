const { User } = require('../models');
const { BadRequestError } = require('../core/error.response');
const notificationService = require('./notification.service');

class CardService {
  async registerCard(userId, data) {
    const { userType, fullName, phone, address, avatar } = data;
    const user = await User.findByPk(userId);

    if (!user) {
      throw new BadRequestError('Tài khoản người dùng không tồn tại');
    }

    if (user.cardStatus === 'active') {
      throw new BadRequestError('Bạn đã có Thẻ thư viện đang hoạt động!');
    }

    user.userType = userType || 'student';
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (avatar) user.avatar = avatar;

    user.cardStatus = 'pending';
    user.cardAppliedAt = new Date();
    user.rejectReason = '';

    await user.save();

    // Alert Admin
    await notificationService.createNotification({
      title: 'Hồ sơ đăng ký thẻ mới',
      message: `Bạn đọc ${user.fullName || user.email} vừa gửi yêu cầu cấp Thẻ thư viện.`,
      type: 'info',
      category: 'card',
      link: '/admin/cards',
      sendToAdmin: true,
    });

    return user;
  }

  async cancelCardApplication(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new BadRequestError('Tài khoản không tồn tại');
    }
    if (user.cardStatus !== 'pending') {
      throw new BadRequestError('Chỉ có thể hủy yêu cầu khi đang chờ duyệt');
    }

    user.cardStatus = 'none';
    user.rejectReason = '';
    await user.save();
    return user;
  }

  async getMyCardInfo(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'fullName', 'email', 'phone', 'address', 'avatar', 'userType', 'cardStatus', 'memberCode', 'cardExpiryDate', 'cardAppliedAt', 'maxBorrowLimit', 'rejectReason']
    });
    if (!user) {
      throw new BadRequestError('Người dùng không tồn tại');
    }
    return user;
  }

  async getAllCardsAdmin() {
    const cards = await User.findAll({
      attributes: ['id', 'fullName', 'email', 'phone', 'address', 'avatar', 'userType', 'cardStatus', 'memberCode', 'cardExpiryDate', 'cardAppliedAt', 'maxBorrowLimit', 'rejectReason', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    return cards;
  }

  async approveCardAdmin(userId, data = {}) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new BadRequestError('Hồ sơ thẻ không tồn tại');
    }

    const { memberCode, expiryMonths = 12, maxBorrowLimit } = data;
    
    // Auto-generate card number if not specified
    const generatedCode = memberCode || `CARD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + Number(expiryMonths));
    const formattedExpiry = expiryDate.toISOString().slice(0, 10);

    user.cardStatus = 'active';
    user.memberCode = user.memberCode || generatedCode;
    user.cardExpiryDate = formattedExpiry;
    user.rejectReason = '';
    user.maxBorrowLimit = maxBorrowLimit || (user.userType === 'guest' ? 2 : 5);

    await user.save();

    // Push real-time notification to user
    await notificationService.createNotification({
      userId: user.id,
      title: 'Thẻ Thư Viện Đã Được Kích Hoạt!',
      message: `Chúc mừng bạn! Thẻ thư viện điện tử (${user.memberCode}) đã được phê duyệt thành công, có hiệu lực đến ${formattedExpiry}.`,
      type: 'success',
      category: 'card',
      link: '/profile',
    });

    // Send Transactional Email
    if (user.email) {
      const emailService = require('./email.service');
      emailService.sendCardApprovalEmail(user.email, {
        fullName: user.fullName || 'Bạn đọc',
        memberCode: user.memberCode,
        cardExpiryDate: formattedExpiry,
        maxBorrowLimit: user.maxBorrowLimit,
      }).catch(err => console.warn('Card approval email error:', err.message));
    }

    return user;
  }

  async rejectCardAdmin(userId, data = {}) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new BadRequestError('Hồ sơ thẻ không tồn tại');
    }

    const { rejectReason } = data;
    user.cardStatus = 'rejected';
    user.rejectReason = rejectReason || 'Thông tin hồ sơ hoặc ảnh 3x4 không đạt yêu cầu';
    await user.save();

    // Push real-time notification to user
    await notificationService.createNotification({
      userId: user.id,
      title: 'Yêu Cầu Làm Thẻ Cần Bổ Sung',
      message: `Hồ sơ làm thẻ chưa được duyệt. Lý do: ${user.rejectReason}. Vui lòng cập nhật lại thông tin.`,
      type: 'warning',
      category: 'card',
      link: '/profile',
    });

    return user;
  }

  async updateCardStatusAdmin(userId, data = {}) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new BadRequestError('Tài khoản không tồn tại');
    }

    const { cardStatus, rejectReason, cardExpiryDate, maxBorrowLimit } = data;
    if (cardStatus) user.cardStatus = cardStatus;
    if (rejectReason !== undefined) user.rejectReason = rejectReason;
    if (cardExpiryDate) user.cardExpiryDate = cardExpiryDate;
    if (maxBorrowLimit !== undefined) user.maxBorrowLimit = maxBorrowLimit;

    await user.save();
    return user;
  }
}

module.exports = new CardService();
