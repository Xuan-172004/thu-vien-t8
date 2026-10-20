const RentalPolicy = require('../models/rentalPolicy.model');
const { BadRequestError } = require('../core/error.response');

const defaultPoliciesSeed = [
    {
        id: 'student',
        cardType: 'student',
        cardTypeName: 'Thẻ Sinh Viên',
        maxBorrowDays: 14,
        maxBorrowBooks: 5,
        allowHomeBorrow: true,
        allowRoomRead: true,
        maxExtensions: 2,
        extensionDays: 7,
        overdueFinePerDay: 5000,
        damagedBookFinePercent: 50,
        lostBookFinePercent: 200,
        specialDocFineRate: 10000,
        autoLockDaysOverdue: 30,
        dailyRateTier1: 5000,
        dailyRateTier2: 3000,
        dailyRateTier3: 2000,
        dailyRateTier4: 1500,
        description: 'Chính sách áp dụng cho thẻ mượn Sinh viên chính quy',
    },
    {
        id: 'teacher',
        cardType: 'teacher',
        cardTypeName: 'Thẻ Giảng Viên / Cán Bộ',
        maxBorrowDays: 30,
        maxBorrowBooks: 10,
        allowHomeBorrow: true,
        allowRoomRead: true,
        maxExtensions: 3,
        extensionDays: 14,
        overdueFinePerDay: 3000,
        damagedBookFinePercent: 50,
        lostBookFinePercent: 150,
        specialDocFineRate: 5000,
        autoLockDaysOverdue: 60,
        description: 'Chính sách ưu đãi mở rộng dành cho Giảng viên & Cán bộ trường',
    },
    {
        id: 'guest',
        cardType: 'guest',
        cardTypeName: 'Thẻ Khách Vãng Lai',
        maxBorrowDays: 7,
        maxBorrowBooks: 3,
        allowHomeBorrow: false,
        allowRoomRead: true,
        maxExtensions: 1,
        extensionDays: 3,
        overdueFinePerDay: 10000,
        damagedBookFinePercent: 100,
        lostBookFinePercent: 250,
        specialDocFineRate: 15000,
        autoLockDaysOverdue: 15,
        description: 'Chính sách áp dụng cho thẻ mượn đọc tại chỗ của Khách vãng lai',
    },
];

class RentalPolicyService {
    async getAllPolicies() {
        let policies = await RentalPolicy.findAll({ order: [['createdAt', 'ASC']] });
        if (policies.length === 0) {
            policies = await RentalPolicy.bulkCreate(defaultPoliciesSeed);
        }
        return policies;
    }

    async getPolicyById(id) {
        let policy = await RentalPolicy.findByPk(id);
        if (!policy) {
            const defaultSeed = defaultPoliciesSeed.find(p => p.id === id);
            if (defaultSeed) {
                policy = await RentalPolicy.create(defaultSeed);
            } else {
                throw new BadRequestError('Chính sách mượn trả không tồn tại');
            }
        }
        return policy;
    }

    async updatePolicy(id, data) {
        let policy = await RentalPolicy.findByPk(id);
        if (!policy) {
            const defaultSeed = defaultPoliciesSeed.find(p => p.id === id);
            if (defaultSeed) {
                policy = await RentalPolicy.create({ ...defaultSeed, ...data });
                return policy;
            }
            throw new BadRequestError('Chính sách mượn trả không tồn tại');
        }
        await policy.update(data);
        return policy;
    }
}

module.exports = new RentalPolicyService();
