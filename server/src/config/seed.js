const { Category, Book, BookCopy, User } = require('../models');
const bcrypt = require('bcrypt');

const seedData = async () => {
    try {
        const categoryCount = await Category.count();
        if (categoryCount > 0) {
            console.log('🌱 MySQL Database already contains seed data.');
            return;
        }

        console.log('🌱 Seeding MySQL Database with initial categories, books, and users...');

        // 1. Seed Categories
        const categoriesData = [
            { id: 'all', name: 'Tất cả thể loại', icon: 'BookOpen', color: 'bg-blue-500', count: 8 },
            { id: 'van-hoc', name: 'Văn học', icon: 'Feather', color: 'bg-amber-500', count: 1 },
            { id: 'kinh-te', name: 'Kinh tế', icon: 'TrendingUp', color: 'bg-emerald-500', count: 1 },
            { id: 'cong-nghe', name: 'Công nghệ', icon: 'Cpu', color: 'bg-indigo-500', count: 1 },
            { id: 'lap-trinh', name: 'Lập trình', icon: 'Code', color: 'bg-purple-500', count: 1 },
            { id: 'khoa-hoc', name: 'Khoa học', icon: 'Atom', color: 'bg-teal-500', count: 1 },
            { id: 'ky-nang', name: 'Kỹ năng sống', icon: 'Compass', color: 'bg-rose-500', count: 2 },
            { id: 'tam-ly', name: 'Tâm lý', icon: 'Brain', color: 'bg-violet-500', count: 1 },
        ];
        await Category.bulkCreate(categoriesData);

        // 2. Seed Admin & User accounts
        const passwordHash = bcrypt.hashSync('123456', 10);
        await User.create({
            fullName: 'Phạm Văn Luân',
            email: 'luan.pv@student.edu.vn',
            password: passwordHash,
            role: 'superadmin',
            isAdmin: true,
            memberCode: 'LIB-2026-8892',
            phone: '0987654321',
            address: 'Ký túc xá Đại học Quốc Gia, Thủ Đức, TP.HCM',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        });

        // 3. Seed Books & Physical Copies
        const booksData = [
            {
                id: 'b1',
                title: 'Clean Code - Mã Sạch Về Thiết Kế Và Cấu Trúc Phần Mềm',
                author: 'Robert C. Martin',
                categoryId: 'lap-trinh',
                categoryName: 'Lập trình',
                publisher: 'NXB Lao Động',
                year: 2023,
                isbn: '978-604-55-1234-5',
                pages: 464,
                language: 'Tiếng Việt',
                cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800',
                rating: 4.9,
                reviewsCount: 328,
                rentCount: 1420,
                price7Days: 20000,
                price14Days: 35000,
                price30Days: 60000,
                deposit: 80000,
                marketPrice: 285000,
                availabilityStatus: 'available',
                totalCopies: 6,
                availableCopies: 4,
                location: 'Thư viện Trung tâm - Kệ A3-02',
                condition: 'Rất tốt (96%)',
                summary:
                    'Ngay cả code tồi cũng có thể hoạt động được. Nhưng nếu code không sạch, nó có thể làm cho một tổ chức phát triển phần mềm phải quỳ gối. Mỗi năm, vô số thời gian và tài nguyên bị lãng phí vì code viết kém chất lượng.',
            },
            {
                id: 'b2',
                title: 'Atomic Habits - Thay Đổi Tí Hon Hiệu Quả Bất Ngờ',
                author: 'James Clear',
                categoryId: 'ky-nang',
                categoryName: 'Kỹ năng sống',
                publisher: 'NXB Thế Giới',
                year: 2022,
                isbn: '978-604-77-9876-1',
                pages: 388,
                language: 'Tiếng Việt',
                cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
                rating: 4.8,
                reviewsCount: 512,
                rentCount: 2310,
                price7Days: 15000,
                price14Days: 25000,
                price30Days: 45000,
                deposit: 50000,
                marketPrice: 189000,
                availabilityStatus: 'low_stock',
                totalCopies: 5,
                availableCopies: 1,
                location: 'Thư viện Trung tâm - Kệ B1-05',
                condition: 'Tốt (92%)',
                summary:
                    'Atomic Habits là cuốn sách hướng dẫn thực tế về việc làm thế nào để thay đổi thói quen nhỏ mỗi ngày 1% để đạt được kết quả phi thường trong sự nghiệp và cuộc sống.',
            },
            {
                id: 'b3',
                title: 'Nhà Giả Kim (The Alchemist)',
                author: 'Paulo Coelho',
                categoryId: 'van-hoc',
                categoryName: 'Văn học',
                publisher: 'NXB Hội Nhà Văn',
                year: 2021,
                isbn: '978-604-99-4321-0',
                pages: 228,
                language: 'Tiếng Việt',
                cover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800',
                rating: 4.9,
                reviewsCount: 890,
                rentCount: 3500,
                price7Days: 12000,
                price14Days: 20000,
                price30Days: 35000,
                deposit: 40000,
                marketPrice: 110000,
                availabilityStatus: 'available',
                totalCopies: 8,
                availableCopies: 6,
                location: 'Thư viện Trung tâm - Kệ C2-10',
                condition: 'Rất tốt (98%)',
                summary:
                    'Tất cả những trải nghiệm trong chuyến phiêu du theo đuổi vận mệnh đã giúp Santiago nhận ra ý nghĩa sâu xa nhất của hạnh phúc, sự hòa hợp với vũ trụ và trái tim mình.',
            },
        ];

        for (const b of booksData) {
            await Book.create(b);
            // Create serial copies
            for (let i = 1; i <= b.totalCopies; i++) {
                await BookCopy.create({
                    bookId: b.id,
                    copyId: `BK-${b.id.toUpperCase()}-00${i}`,
                    status: i <= b.availableCopies ? 'Available' : 'Rented',
                    statusText: i <= b.availableCopies ? 'Có sẵn' : 'Đang được thuê',
                    location: b.location,
                });
            }
        }

        console.log('✅ MySQL Database seeded successfully!');
    } catch (error) {
        console.error('❌ Failed to seed database:', error);
    }
};

module.exports = seedData;
