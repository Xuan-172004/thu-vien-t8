const { Op } = require('sequelize');
const { Article } = require('../models');
const { BadRequestError, NotFoundError } = require('../core/error.response');

class ArticleService {
    /**
     * Tự động khởi tạo dữ liệu bài viết mẫu nếu bảng rỗng
     */
    async seedDefaultArticlesIfEmpty() {
        try {
            const count = await Article.count();
            if (count > 0) return;

            const sampleArticles = [
                {
                    title: 'Thông Báo: Kế Hoạch Phục Vụ Phòng Đọc & Hộp Trả Sách 24/7 Xuyên Tết 2026',
                    slug: 'thong-bao-ke-hoach-phuc-vu-phong-doc-xuyen-tet-2026',
                    summary: 'Nhằm tạo điều kiện cho bạn đọc và sinh viên ôn tập làm đồ án tốt nghiệp, Thư viện Trung tâm sẽ mở cửa khu tự học 24/7 và hệ thống mượn trả tự động xuyên kỳ nghỉ Tết.',
                    content: `
                        <h2>1. Kế hoạch mở cửa các phòng chức năng</h2>
                        <p>Thư viện Đại học trân trọng thông báo đến toàn thể cán bộ, giảng viên, học viên và sinh viên lịch phục vụ trong dịp Tết Nguyên Đán 2026:</p>
                        <ul>
                            <li><strong>Phòng đọc đa năng Tầng 2 & 3:</strong> Mở cửa phục vụ từ 8h00 đến 17h00 các ngày trong tuần.</li>
                            <li><strong>Không gian tự học 24/7 (Tầng 1):</strong> Mở cửa 24/24 suốt kỳ nghỉ lễ (Quẹt Thẻ Thư Viện điện tử tại cửa kiểm soát).</li>
                            <li><strong>Hộp trả sách thông minh 24/7:</strong> Hoạt động liên tục, bạn đọc có thể hoàn trả sách bất cứ lúc nào.</li>
                        </ul>
                        <h2>2. Chính sách gia hạn sách mượn tự động</h2>
                        <p>Tất cả các phiếu mượn sách có hạn trả rơi vào các ngày nghỉ Tết sẽ được hệ thống <strong>tự động gia hạn thêm 10 ngày</strong> mà không tính phí phạt trễ hạn.</p>
                        <p>Kính chúc toàn thể bạn đọc một năm mới An Khang Thịnh Vượng và gặt hái nhiều thành công trong học tập!</p>
                    `,
                    thumbnail: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
                    category: 'notice',
                    author: 'Ban Quản Trị Thư Viện',
                    status: 'published',
                    views: 1240,
                    isFeatured: true,
                    publishedAt: new Date(),
                },
                {
                    title: 'Khai Mạc Ngày Hội Sách & Văn Hóa Đọc 2026: Triển Lãm 10.000 Đầu Sách Học Thuật',
                    slug: 'khai-mac-ngay-hoi-sach-va-van-hoa-doc-2026',
                    summary: 'Sự kiện thường niên lớn nhất trong năm quy tụ hàng nghìn đầu sách kinh điển, tọa đàm cùng các tác giả nổi tiếng và chương trình tặng tài liệu số độc quyền.',
                    content: `
                        <h2>Chào mừng Ngày Sách và Văn hóa đọc Việt Nam</h2>
                        <p>Nhằm lan tỏa tình yêu sách và thúc đẩy phong trào tự học, nghiên cứu khoa học, Thư viện phối hợp cùng Hội đồng Khoa học tổ chức <strong>Ngày Hội Sách & Văn Hóa Đọc 2026</strong> với chủ đề <em>"Khơi Nguồn Tri Thức - Định Hình Tương Lai"</em>.</p>
                        <h3>Các hoạt động nổi bật:</h3>
                        <ul>
                            <li>Triển lãm hơn 10.000 đầu sách chuyên ngành Công nghệ thông tin, Kinh tế, Y khoa và Khoa học xã hội.</li>
                            <li>Tọa đàm: "Phương pháp đọc hiểu nhanh và nghiên cứu tài liệu học thuật trong kỷ nguyên AI".</li>
                            <li>Gian hàng đổi sách cũ lấy thẻ đọc số và voucher nạp ví thư viện trị giá lên đến 200.000 VNĐ.</li>
                        </ul>
                        <p><strong>Thời gian:</strong> 08:00 - 17:30 ngày 15 - 18 tháng 03 năm 2026.<br /><strong>Địa điểm:</strong> Sảnh chính Tòa nhà Thư viện Trung tâm.</p>
                    `,
                    thumbnail: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80',
                    category: 'event',
                    author: 'Thủ thư Trưởng',
                    status: 'published',
                    views: 2890,
                    isFeatured: true,
                    eventDate: '15 - 18/03/2026',
                    eventLocation: 'Sảnh chính Tòa nhà Thư viện',
                    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                },
                {
                    title: 'Hướng Dẫn Quy Trình Nộp Khóa Luận & Đồ Án Tốt Nghiệp Lưu Chiểu Điện Tử',
                    slug: 'huong-dan-quy-trinh-nop-khoa-luan-do-an-tot-nghiep-2026',
                    summary: 'Cẩm nang chi tiết hướng dẫn sinh viên năm cuối quy chuẩn định dạng file PDF, trang bìa, chữ ký GVHD và các bước nộp trực tuyến nhận mã THESIS.',
                    content: `
                        <h2>Quy chuẩn nộp lưu chiểu tài liệu số</h2>
                        <p>Sinh viên các khoa chuẩn bị bảo vệ tốt nghiệp đợt 1 năm 2026 cần hoàn thành nghĩa vụ nộp lưu chiểu đồ án/khóa luận theo đúng quy trình sau:</p>
                        <ol>
                            <li><strong>Chuẩn bị file PDF toàn văn:</strong> Bao gồm trang bìa có chữ ký xác nhận của GVHD, mục lục, nội dung, danh mục tài liệu tham khảo và phụ lục. Dung lượng tối đa 50MB.</li>
                            <li><strong>Truy cập Cổng nộp trực tuyến:</strong> Đăng nhập tài khoản và chọn mục <em>"Nộp Đồ Án / Luận Văn"</em> trên thanh điều hướng.</li>
                            <li><strong>Điền đầy đủ thông tin:</strong> Tên đề tài, GVHD, Hội đồng bảo vệ, Điểm số, Tóm tắt đề tài (Abstract) và Từ khóa (Keywords).</li>
                            <li><strong>Phê duyệt & Nhận mã lưu chiểu:</strong> Trong vòng 24-48h, Thủ thư sẽ kiểm tra thể thức. Sau khi duyệt, bạn sẽ nhận được Email xác nhận kèm mã số lưu chiểu quốc gia <code>THESIS-2026-xxx</code> để hoàn tất hồ sơ nhận bằng.</li>
                        </ol>
                    `,
                    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
                    category: 'guide',
                    author: 'Phòng Lưu Chiểu & Số Hóa',
                    status: 'published',
                    views: 4510,
                    isFeatured: false,
                    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                },
                {
                    title: 'Thư Viện Bổ Sung 500+ Đầu Sách Mới Chuyên Ngành Trí Tuệ Nhân Tạo & Cloud Native',
                    slug: 'thu-vien-bo-sung-500-dau-sach-chuyen-nganh-ai-cloud-native',
                    summary: 'Kho tài liệu vừa được cập nhật các giáo trình và sách chuyên khảo mới nhất từ các nhà xuất bản hàng đầu thế giới như O\'Reilly, Springer, Wiley và MIT Press.',
                    content: `
                        <h2>Cập nhật tài nguyên học thuật quốc tế</h2>
                        <p>Thực hiện kế hoạch hiện đại hóa nguồn học liệu, Thư viện vừa hoàn tất xử lý kỹ thuật và đưa vào lưu thông hơn 500 đầu sách in và tài liệu số bản quyền chuyên ngành mũi nhọn:</p>
                        <ul>
                            <li><strong>Generative AI & LLMs:</strong> Kiến trúc Transformer, Fine-tuning mô hình ngôn ngữ lớn, Kỹ thuật Prompt Engineering nâng cao.</li>
                            <li><strong>Cloud Native & Microservices:</strong> Kubernetes in Action, Distributed Systems with Go, Domain-Driven Design.</li>
                            <li><strong>Data Science & MLOps:</strong> Pipeline dữ liệu tự động, Deep Learning với PyTorch 2.x, Tối ưu hóa mô hình AI trên thiết bị biên (Edge AI).</li>
                        </ul>
                        <p>Bạn đọc có thể tra cứu mã ĐKCB tại thanh tìm kiếm hoặc đặt mượn online giữ sách trước ngay hôm nay.</p>
                    `,
                    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
                    category: 'news',
                    author: 'Phòng Bổ Sung & Xử Lý Nghiệp Vụ',
                    status: 'published',
                    views: 980,
                    isFeatured: false,
                    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
                {
                    title: 'Hội Thảo Khoa Học: "Ứng Dụng AI & LLM Trong Nghiên Cứu Và Khai Thác Tri Thức Số"',
                    slug: 'hoi-thao-ung-dung-ai-llm-trong-nghien-cuu-hoc-thuat',
                    summary: 'Cơ hội lắng nghe các chuyên gia công nghệ hàng đầu chia sẻ về phương pháp khai thác cơ sở dữ liệu số, phân tích dữ liệu nghiên cứu và đạo đức học thuật khi dùng AI.',
                    content: `
                        <h2>Chương trình Hội thảo chuyên đề</h2>
                        <p>Thư viện phối hợp cùng Viện Nghiên cứu Trí tuệ Nhân tạo tổ chức buổi tọa đàm học thuật đặc biệt dành cho nghiên cứu sinh, giảng viên và sinh viên yêu thích công nghệ.</p>
                        <h3>Nội dung chính:</h3>
                        <ul>
                            <li>Tổng quan về các công cụ AI hỗ trợ nghiên cứu (Semantic Scholar, Consensus, LangChain).</li>
                            <li>Kỹ năng trích dẫn, tra cứu tài liệu khoa học chuẩn quốc tế và phòng tránh vi phạm bản quyền / đạo văn.</li>
                            <li>Trải nghiệm thực tế công cụ Trợ lý Thư viện AI thông minh được phát triển riêng cho nhà trường.</li>
                        </ul>
                        <p><strong>Diễn giả:</strong> TS. Nguyễn Hoàng Nam (Giám đốc Viện Công nghệ AI) & ThS. Lê Thị Mai (Chuyên gia Thông tin Thư viện).<br /><strong>Thời gian:</strong> 14:00 Thứ Sáu, ngày 28/03/2026.<br /><strong>Địa điểm:</strong> Hội trường tầng 4, Thư viện Trung tâm.</p>
                    `,
                    thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
                    category: 'event',
                    author: 'Ban Tổ Chức Sự Kiện',
                    status: 'published',
                    views: 1850,
                    isFeatured: false,
                    eventDate: '28/03/2026 (14:00)',
                    eventLocation: 'Hội trường Tầng 4 Thư viện',
                    publishedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
                },
                {
                    title: 'Quy Định Mới Về Cấp Đổi Thẻ Thư Viện Điện Tử Tích Hợp Nhận Diện Mã Vạch & RFID',
                    slug: 'quy-dinh-moi-ve-cap-doi-the-thu-vien-dien-tu-2026',
                    summary: 'Từ học kỳ này, Thư viện chính thức triển khai Thẻ Thư Viện Điện Tử trên điện thoại, đồng bộ mã QR và mã vạch cho phép mượn sách tự động qua trạm Self-Check.',
                    content: `
                        <h2>Hiện đại hóa thủ tục cấp thẻ bạn đọc</h2>
                        <p>Nhằm nâng cao chất lượng phục vụ và giảm thiểu thủ tục giấy tờ, Ban Giám đốc Thư viện ban hành quy định chuyển đổi số toàn diện cho Thẻ Thư Viện:</p>
                        <ul>
                            <li><strong>Kích hoạt trực tuyến 100%:</strong> Sinh viên và giảng viên chỉ cần đăng nhập tài khoản trường, bổ sung thông tin và nộp hồ sơ trực tiếp trên website.</li>
                            <li><strong>Sử dụng Thẻ Điện Tử:</strong> Mã thẻ <code>CARD-2026-xxx</code> kèm mã QR và Barcode hiển thị trực tiếp trên mục <em>"Trang Cá Nhân / Thẻ Thư Viện"</em>.</li>
                            <li><strong>Tích hợp trạm mượn trả tự động Self-Check:</strong> Độc giả có thể tự quét mã thẻ và mã vạch sách để hoàn tất thủ tục mượn sách trong 30 giây mà không cần xếp hàng tại quầy.</li>
                        </ul>
                    `,
                    thumbnail: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
                    category: 'notice',
                    author: 'Ban Quản Trị Thư Viện',
                    status: 'published',
                    views: 3120,
                    isFeatured: false,
                    publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
                },
            ];

            await Article.bulkCreate(sampleArticles);
            console.log('✅ Seeded default library articles successfully');
        } catch (err) {
            console.warn('⚠️ Seed default articles error:', err.message);
        }
    }

    /**
     * Lấy danh sách bài viết (Public & Admin)
     */
    async getAllArticles({
        page = 1,
        limit = 10,
        category,
        status,
        search,
        featured,
        sort = 'latest',
    }) {
        await this.seedDefaultArticlesIfEmpty();

        const where = {};

        if (status && status !== 'all') {
            where.status = status;
        } else if (!status) {
            where.status = 'published'; // Public mặc định chỉ xem bài đã đăng
        }

        if (category && category !== 'all') {
            where.category = category;
        }

        if (featured === 'true' || featured === true) {
            where.isFeatured = true;
        }

        if (search && search.trim()) {
            where[Op.or] = [
                { title: { [Op.like]: `%${search.trim()}%` } },
                { summary: { [Op.like]: `%${search.trim()}%` } },
            ];
        }

        const offset = (Number(page) - 1) * Number(limit);
        let order = [['publishedAt', 'DESC']];

        if (sort === 'views') {
            order = [['views', 'DESC'], ['publishedAt', 'DESC']];
        } else if (sort === 'oldest') {
            order = [['publishedAt', 'ASC']];
        }

        const { count, rows } = await Article.findAndCountAll({
            where,
            offset,
            limit: Number(limit),
            order,
        });

        return {
            articles: rows,
            total: count,
            page: Number(page),
            totalPages: Math.ceil(count / Number(limit)),
            limit: Number(limit),
        };
    }

    /**
     * Lấy chi tiết bài viết theo Slug hoặc ID và tự động tăng lượt xem
     */
    async getArticleBySlugOrId(identifier) {
        await this.seedDefaultArticlesIfEmpty();

        let article;
        if (!isNaN(identifier)) {
            article = await Article.findByPk(identifier);
        } else {
            article = await Article.findOne({ where: { slug: identifier } });
        }

        if (!article) {
            throw new NotFoundError('Không tìm thấy bài viết yêu cầu!');
        }

        // Tăng views
        await article.increment('views', { by: 1 }).catch(() => null);

        // Lấy bài viết liên quan cùng category
        const relatedArticles = await Article.findAll({
            where: {
                category: article.category,
                id: { [Op.ne]: article.id },
                status: 'published',
            },
            limit: 4,
            order: [['publishedAt', 'DESC']],
        });

        return {
            article,
            relatedArticles,
        };
    }

    /**
     * Tạo bài viết mới (Admin)
     */
    async createArticle(data, adminUser) {
        const {
            title,
            summary,
            content,
            thumbnail,
            category = 'news',
            status = 'published',
            isFeatured = false,
            eventDate,
            eventLocation,
        } = data;

        if (!title || !title.trim()) {
            throw new BadRequestError('Vui lòng nhập tiêu đề bài viết!');
        }
        if (!content || !content.trim()) {
            throw new BadRequestError('Vui lòng nhập nội dung chi tiết bài viết!');
        }

        // Generate Slug
        let baseSlug = title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        let uniqueSlug = baseSlug;
        let counter = 1;
        while (await Article.findOne({ where: { slug: uniqueSlug } })) {
            uniqueSlug = `${baseSlug}-${counter}`;
            counter++;
        }

        const newArticle = await Article.create({
            title: title.trim(),
            slug: uniqueSlug,
            summary: summary ? summary.trim() : title.trim(),
            content: content.trim(),
            thumbnail: thumbnail || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
            category,
            author: adminUser?.fullName || 'Ban Quản Trị Thư Viện',
            status,
            isFeatured: Boolean(isFeatured),
            eventDate: eventDate || null,
            eventLocation: eventLocation || null,
            publishedAt: status === 'published' ? new Date() : null,
        });

        return newArticle;
    }

    /**
     * Cập nhật bài viết (Admin)
     */
    async updateArticle(id, data) {
        const article = await Article.findByPk(id);
        if (!article) {
            throw new NotFoundError('Không tìm thấy bài viết để cập nhật!');
        }

        const {
            title,
            summary,
            content,
            thumbnail,
            category,
            status,
            isFeatured,
            eventDate,
            eventLocation,
        } = data;

        if (title && title.trim() !== article.title) {
            article.title = title.trim();
        }
        if (summary !== undefined) article.summary = summary ? summary.trim() : '';
        if (content !== undefined) article.content = content.trim();
        if (thumbnail !== undefined) article.thumbnail = thumbnail;
        if (category !== undefined) article.category = category;
        if (status !== undefined) {
            article.status = status;
            if (status === 'published' && !article.publishedAt) {
                article.publishedAt = new Date();
            }
        }
        if (isFeatured !== undefined) article.isFeatured = Boolean(isFeatured);
        if (eventDate !== undefined) article.eventDate = eventDate;
        if (eventLocation !== undefined) article.eventLocation = eventLocation;

        await article.save();
        return article;
    }

    /**
     * Xóa bài viết (Admin)
     */
    async deleteArticle(id) {
        const article = await Article.findByPk(id);
        if (!article) {
            throw new NotFoundError('Không tìm thấy bài viết!');
        }
        await article.destroy();
        return { message: 'Đã xóa bài viết thành công!' };
    }

    /**
     * Bật/tắt trạng thái Publish (Admin)
     */
    async toggleArticleStatus(id) {
        const article = await Article.findByPk(id);
        if (!article) {
            throw new NotFoundError('Không tìm thấy bài viết!');
        }

        article.status = article.status === 'published' ? 'draft' : 'published';
        if (article.status === 'published' && !article.publishedAt) {
            article.publishedAt = new Date();
        }
        await article.save();
        return article;
    }
}

module.exports = new ArticleService();
