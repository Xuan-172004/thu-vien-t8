import React from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen,
    GraduationCap,
    Award,
    Clock,
    Users,
    Layers,
    Sparkles,
    ShieldCheck,
    CheckCircle2,
    ArrowRight,
    MapPin,
    Phone,
    Mail,
    Building2,
    Search,
    FileText,
    Cpu,
    Wifi,
    Coffee,
} from 'lucide-react';
import TopHeader from '../../components/TopHeader';
import MainHeader from '../../components/MainHeader';
import CategoryNavbar from '../../components/CategoryNavbar';
import Footer from '../../components/Footer';

export function AboutPage() {
    const stats = [
        { label: 'Sách In & Giáo Trình', value: '100.000+', icon: BookOpen, desc: 'Đầy đủ mọi chuyên ngành' },
        { label: 'Luận Văn & Đồ Án', value: '50.000+', icon: GraduationCap, desc: 'Lưu chiểu số quốc gia' },
        { label: 'Tài Liệu Số Bản Quyền', value: '10.000+', icon: FileText, desc: 'Đọc & tải PDF trực tuyến' },
        { label: 'Bạn Đọc Đang Hoạt Động', value: '25.000+', icon: Users, desc: 'Sinh viên & Giảng viên' },
    ];

    const facilities = [
        {
            title: 'Phòng Đọc Tổng Hợp Đa Năng',
            location: 'Tầng 2 & Tầng 3',
            capacity: '800 Chỗ ngồi',
            desc: 'Không gian mở tràn ngập ánh sáng tự nhiên, trang bị bàn đọc cá nhân có cổng sạc, wifi tốc độ cao và điều hòa 24/7.',
            image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
            tags: ['Điều hòa 24/7', 'Wifi 6', 'Ổ cắm điện'],
        },
        {
            title: 'Không Gian Sáng Tạo & Thảo Luận Nhóm (MakerSpace)',
            location: 'Tầng 4',
            capacity: '12 Phòng học nhóm',
            desc: 'Phòng học cách âm được trang bị màn hình thông minh Smart Board 85 inch, máy chiếu 4K hỗ trợ làm việc nhóm và thuyết trình.',
            image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
            tags: ['Smart TV 4K', 'Bảng trắng', 'Cách âm'],
        },
        {
            title: 'Trung Tâm Tra Cứu Điện Tử & Số Hóa',
            location: 'Tầng 1',
            capacity: '120 Trạm máy tính',
            desc: 'Dàn máy tính cấu hình cao kết nối trực tiếp đến các cơ sở dữ liệu học thuật quốc tế như IEEE Xplore, ScienceDirect, SpringerLink.',
            image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
            tags: ['IEEE Xplore', 'Springer', 'Cáp quang 1Gbps'],
        },
        {
            title: 'Khu Vực Tự Học & Hộp Trả Sách 24/7',
            location: 'Sảnh Tầng 1 (Cửa riêng)',
            capacity: '200 Chỗ ngồi xuyên đêm',
            desc: 'Khu vực mở cửa liên tục 24/24 suốt các kỳ thi cử, tích hợp trạm mượn trả sách tự động RFID Self-Check và quầy cà phê tự phục vụ.',
            image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
            tags: ['Mở cửa 24/7', 'Self-Check RFID', 'Coffee Vending'],
        },
    ];

    const team = [
        {
            name: 'PGS. TS. Trần Hải Đăng',
            role: 'Giám Đốc Thư Viện',
            desc: 'Chuyên gia hoạch định chiến lược chuyển đổi số thư viện và bảo tồn di sản học thuật.',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        },
        {
            name: 'ThS. Nguyễn Thị Thu Hà',
            role: 'Trưởng Phòng Nghiệp Vụ & Bổ Sung',
            desc: 'Phụ trách thẩm định nguồn tài nguyên học liệu và kết nối bản quyền quốc tế.',
            avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        },
        {
            name: 'ThS. Vũ Hoàng Minh',
            role: 'Trưởng Bộ Phận Số Hóa & CNTT',
            desc: 'Phát triển hạ tầng lưu chiểu số và tích hợp AI thông minh trong tra cứu.',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        },
    ];

    return (
        <div className="min-h-screen bg-[#faf9f6] text-stone-800 flex flex-col font-sans">
            <TopHeader />
            <MainHeader />
            <CategoryNavbar />

            {/* HERO BANNER */}
            <div className="relative bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 text-white py-20 px-4 md:px-8 overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
                    <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Trái Tim Tri Thức Của Nhà Trường</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-stone-100 max-w-3xl mx-auto leading-tight">
                        Giới Thiệu Về Thư Viện Đại Học & Trung Tâm Tri Thức Số
                    </h1>
                    <p className="text-stone-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                        Hệ thống Thư viện Đại học thông minh 4.0 kết hợp không gian học tập truyền cảm hứng cùng kho tài nguyên số hóa toàn diện phục vụ giảng dạy, học tập và nghiên cứu.
                    </p>
                </div>
            </div>

            {/* STATS COUNTER */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-10 relative z-20 w-full">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((st, idx) => {
                        const Icon = st.icon;
                        return (
                            <div key={idx} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xl flex flex-col items-center text-center space-y-2">
                                <div className="p-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
                                    <Icon className="w-6 h-6 stroke-[2.2]" />
                                </div>
                                <div className="text-2xl md:text-3xl font-black text-stone-900">{st.value}</div>
                                <div className="text-xs font-bold text-stone-700">{st.label}</div>
                                <div className="text-[11px] text-stone-400 font-medium">{st.desc}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MISSION & VISION */}
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 text-xs font-black text-amber-700 uppercase tracking-widest">
                            <Building2 className="w-4 h-4" /> Sứ Mệnh & Tầm Nhìn
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black text-stone-900 leading-tight">
                            Kiến tạo không gian học thuật mở và kết nối nguồn tri thức không giới hạn
                        </h2>
                        <p className="text-stone-600 text-sm leading-relaxed">
                            Được thành lập cùng sự ra đời của Nhà trường, Thư viện Đại học không ngừng đổi mới từ một thư viện truyền thống trở thành <strong>Trung tâm Tri thức & Công nghệ Số</strong> hàng đầu. Chúng tôi cam kết mang lại trải nghiệm tra cứu tối ưu nhất cho sinh viên, giảng viên và các nhà nghiên cứu độc lập.
                        </p>

                        <div className="space-y-3 pt-2">
                            {[
                                'Số hóa 100% Khóa luận, Luận văn và Đề tài nghiên cứu khoa học của Trường.',
                                'Trang bị hệ thống mượn - trả tự động RFID Self-Check chuẩn quốc tế.',
                                'Hệ thống kho mở thông minh, tra cứu vị trí kệ sách theo thời gian thực.',
                                'Tích hợp Trợ lý Trí tuệ Nhân tạo AI hỗ trợ tóm tắt tài liệu học thuật.',
                            ].map((item, i) => (
                                <div key={i} className="flex items-start gap-3 text-xs font-semibold text-stone-700">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative">
                        <div className="aspect-[4/3] rounded-3xl overflow-hidden border-2 border-stone-200 shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1000&q=80"
                                alt="Toàn cảnh Thư Viện"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="absolute -bottom-6 -left-6 bg-stone-900 text-white p-5 rounded-2xl border border-stone-800 shadow-xl max-w-xs hidden sm:block">
                            <div className="text-amber-400 font-extrabold text-lg">30+ Năm Phát Triển</div>
                            <p className="text-xs text-stone-300 mt-1">Đồng hành cùng sự nghiệp đào tạo và vươn tầm học thuật của hàng chục thế hệ sinh viên.</p>
                        </div>
                    </div>
                </div>

                {/* FACILITIES SECTION */}
                <div className="space-y-8">
                    <div className="text-center space-y-2 max-w-2xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-black text-stone-900">
                            Cơ Sở Vật Chất & Hệ Thống Phòng Chức Năng
                        </h2>
                        <p className="text-xs md:text-sm text-stone-500">
                            Thư viện được quy hoạch hiện đại 5 tầng với tổng diện tích mặt sàn hơn 12.000m², phục vụ đồng thời hơn 2.000 độc giả.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {facilities.map((fac, idx) => (
                            <div key={idx} className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between">
                                <div className="h-48 overflow-hidden relative">
                                    <img
                                        src={fac.image}
                                        alt={fac.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full border border-stone-700">
                                        {fac.location}
                                    </div>
                                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-stone-900 text-[11px] font-extrabold px-3 py-1 rounded-full shadow-xs">
                                        {fac.capacity}
                                    </div>
                                </div>
                                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-base font-black text-stone-900 group-hover:text-amber-700 transition-colors">
                                            {fac.title}
                                        </h3>
                                        <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                                            {fac.desc}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-3 border-t border-stone-100">
                                        {fac.tags.map((t, i) => (
                                            <span key={i} className="text-[10px] font-bold bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* LEADERSHIP & LIBRARIANS */}
                <div className="space-y-8">
                    <div className="text-center space-y-2 max-w-2xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-black text-stone-900">
                            Đội Ngũ Quản Lý & Cán Bộ Thư Viện
                        </h2>
                        <p className="text-xs md:text-sm text-stone-500">
                            Đội ngũ thủ thư nhiệt huyết, tận tâm và giàu kinh nghiệm luôn sẵn sàng hỗ trợ bạn đọc trong việc tiếp cận và khai thác nguồn tri thức.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {team.map((mem, idx) => (
                            <div key={idx} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm text-center space-y-4 hover:shadow-lg transition-all">
                                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-amber-400 p-1">
                                    <img src={mem.avatar} alt={mem.name} className="w-full h-full object-cover rounded-full" />
                                </div>
                                <div>
                                    <h4 className="font-black text-stone-900 text-sm">{mem.name}</h4>
                                    <span className="text-amber-700 font-bold text-xs block mt-0.5">{mem.role}</span>
                                </div>
                                <p className="text-xs text-stone-500 leading-relaxed">{mem.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA BANNER */}
                <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
                    <div className="space-y-2 text-center md:text-left">
                        <h3 className="text-xl md:text-2xl font-black">Bạn Đã Có Thẻ Thư Viện Chưa?</h3>
                        <p className="text-amber-100 text-xs md:text-sm max-w-xl">
                            Đăng ký cấp Thẻ Thư Viện điện tử trực tuyến chỉ mất 1 phút để mượn sách giấy về nhà và mở khóa trọn vẹn kho học liệu số!
                        </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <Link
                            to="/rules"
                            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors"
                        >
                            Xem Quy Định
                        </Link>
                        <Link
                            to="/schedule"
                            className="px-6 py-3 rounded-2xl bg-stone-950 hover:bg-black text-amber-400 font-black text-xs shadow-lg transition-transform hover:-translate-y-0.5"
                        >
                            Lịch Phục Vụ &rarr;
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default AboutPage;
