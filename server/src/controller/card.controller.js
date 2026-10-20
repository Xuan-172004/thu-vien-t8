const { OK } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');
const CardService = require('../services/card.service');

class CardController {
  async uploadAvatar(req, res) {
    if (!req.file) {
      throw new BadRequestError('Vui lòng chọn file hình ảnh avatar!');
    }
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;
    const sizeMB = `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`;
    new OK({
      message: 'Upload ảnh 3x4 thành công!',
      metadata: {
        url: fileUrl,
        filename: req.file.originalname,
        storedFilename: req.file.filename,
        size: sizeMB,
      },
    }).send(res);
  }

  async registerCard(req, res) {
    const { id } = req.user;
    const cardData = await CardService.registerCard(id, req.body);
    new OK({ message: 'Gửi hồ sơ đăng ký thẻ thư viện thành công!', metadata: cardData }).send(res);
  }

  async cancelCardApplication(req, res) {
    const { id } = req.user;
    const cardData = await CardService.cancelCardApplication(id);
    new OK({ message: 'Đã hủy yêu cầu đăng ký thẻ', metadata: cardData }).send(res);
  }

  async getMyCardInfo(req, res) {
    const { id } = req.user;
    const cardData = await CardService.getMyCardInfo(id);
    new OK({ message: 'Lấy thông tin thẻ thành công', metadata: cardData }).send(res);
  }

  async getAllCardsAdmin(req, res) {
    const cards = await CardService.getAllCardsAdmin();
    new OK({ message: 'Lấy danh sách thẻ thành công', metadata: cards }).send(res);
  }

  async approveCardAdmin(req, res) {
    const { id } = req.params;
    const cardData = await CardService.approveCardAdmin(id, req.body);
    new OK({ message: 'Duyệt hồ sơ & cấp thẻ thành công!', metadata: cardData }).send(res);
  }

  async rejectCardAdmin(req, res) {
    const { id } = req.params;
    const cardData = await CardService.rejectCardAdmin(id, req.body);
    new OK({ message: 'Từ chối hồ sơ thẻ thành công', metadata: cardData }).send(res);
  }

  async updateCardStatusAdmin(req, res) {
    const { id } = req.params;
    const cardData = await CardService.updateCardStatusAdmin(id, req.body);
    new OK({ message: 'Cập nhật trạng thái thẻ thành công', metadata: cardData }).send(res);
  }
}

module.exports = new CardController();
