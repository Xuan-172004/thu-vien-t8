import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Clock,
    Calendar,
    CheckCircle2,
    AlertTriangle,
    Sparkles,
    BookOpen,
    GraduationCap,
    Repeat,
    Layers,
    Phone,
    Mail,
    MapPin,
    Building2,
    ShieldAlert,
    HelpCircle,
} from 'lucide-react';
import TopHeader from '../../components/TopHeader';
import MainHeader from '../../components/MainHeader';
import CategoryNavbar from '../../components/CategoryNavbar';
import Footer from '../../components/Footer';

export function SchedulePage() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Check if open currently (Mon-Fri: 7:30 - 21:00, Sat-Sun: 8:00 - 17:00)
    const day = currentTime.getDay(); // 0 is Sunday
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const currentDecimalTime = hours + minutes / 60;

    const isWeekend = day === 0 || day === 6;
    const isOpenNow = isWeekend
        ? currentDecimalTime >= 8.0 && currentDecimalTime <= 17.0
        : currentDecimalTime >= 7.5 && currentDecimalTime <= 21.0;

    const roomsSchedule = [
        {
            name: 'Khu Tự Học & Hộp Trả Sách Tự Động (Tầng 1)',
            hoursWeekdays: '24/7 (Cả ngày & đêm)',
            hoursWeekend: '24/7 (Cả ngày & đêm)',
            status: 'Mở cửa 24/7',
            statusColor: 'bg-emerald-50 text-emerald-700 border-emerald-300',
            features: 'Quẹt Thẻ Thư Viện tại cửa kiểm soát an ninh',
            icon: Sparkles,
        },
        {
            name: 'Quầy Thủ Thư & Mượn - Trả Sách Giấy (Tầng 1)',
            hoursWeekdays: '07:30 - 17:00 (Nghỉ trưa 11:30 - 13:00)',
            hoursWeekend: '08:00 - 16:30 (Nghỉ trưa 11:30 - 13:30)',
            status: 'Giờ hành chính',
            statusColor: 'bg-amber-50 text-amber-800 border-amber-300',
            features: 'Lấy sách đã đặt online, xử lý trả sách & nộp phạt',
            icon: Repeat,
        },
        {
            name: 'Phòng Đọc Tổng Hợp & Tra Cứu (Tầng 2 & 3)',
            hoursWeekdays: '07:30 - 21:00 (Thông trưa)',
            hoursWeekend: '08:00 - 17:00 (Thông trưa)',
            status: 'Mở cửa liên tục',
            statusColor: 'bg-blue-50 text-blue-700 border-blue-300',
            features: 'Đọc sách tại chỗ, 800 chỗ ngồi có điều hòa & wifi',
            icon: BookOpen,
        },
        {
            name: 'Phòng Hội Thảo Nhóm & MakerSpace (Tầng 4)',
            hoursWeekdays: '08:00 - 20:00',
            hoursWeekend: '08:30 - 16:30',
            status: 'Cần đặt trước',
            statusColor: 'bg-purple-50 text-purple-700 border-purple-300',
            features: 'Đặt phòng học nhóm tối thiểu 3 người tại quầy',
            icon: Layers,
        },
        {
            name: 'Bộ Phận Thẩm Định & Lưu Chiểu Đồ Án (Tầng 5)',
            hoursWeekdays: '08:00 - 16:30 (Thứ 2 đến Thứ 6)',
            hoursWeekend: 'Nghỉ Thứ 7 & Chủ Nhật',
            status: 'Hỗ trợ sinh viên',
            statusColor: 'bg-stone-100 text-stone-700 border-stone-300',
            features: 'Tiếp nhận kiểm tra thể thức khóa luận tốt nghiệp',
            icon: GraduationCap,
        },
    ];

    const upcomingHolidays = [
        { name: 'Nghỉ Lễ Giỗ Tổ Hùng Vương (10/3 ÂL)', date: 'Thứ Ba, 21/04/2026', note: 'Khu 24/7 mở bình thường, quầy dịch vụ nghỉ' },
        { name: 'Nghỉ Lễ 30/4 & Quốc Tế Lao Động 1/5', date: '30/04 - 03/05/2026', note: 'Nghỉ theo quy định của Nhà trường' },
        { name: 'Bảo trì hệ thống máy chủ định kỳ', date: 'Chủ Nhật, 15/06/2026 (22h - 02h)', note: 'Tạm gián đoạn cổng tra cứu trực tuyến 4 tiếng' },
    ];

    return (
        <div className="min-h-screen bg-[#faf9f6] text-stone-800 flex flex-col font-sans">
            <TopHeader />
            <MainHeader />
            <CategoryNavbar />

            {/* HERO BANNER */}
            <div className="bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 text-white py-16 px-4 md:px-8">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Thời Gian Hoạt Động & Lịch Trực</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-stone-100 leading-tight">
                            Lịch Phục Vụ Thư Viện Đại Học
                        </h1>
                        <p className="text-stone-300 text-sm md:text-base leading-relaxed">
                            Cập nhật thời gian biểu phục vụ từng phòng ban, trạm mượn trả tự động và lịch trực hỗ trợ học thuật cho bạn đọc.
                        </p>
                    </div>

                    {/* LIVE STATUS CARD */}
                    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center space-y-3 w-full md:w-80 shrink-0 shadow-2xl">
                        <div className="text-xs text-stone-300 font-bold uppercase tracking-wider">Trạng Thái Hiện Tại</div>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black shadow-sm ${
                            isOpenNow ? 'bg-emerald-500 text-stone-950 animate-pulse' : 'bg-rose-500 text-white'
                        }`}>
                            <span className="w-2.5 h-2.5 rounded-full bg-current" />
                            <span>{isOpenNow ? 'ĐANG MỞ CỬA PHỤC VỤ' : 'HIỆN ĐÃ ĐÓNG CỬA'}</span>
                        </div>
                        <div className="text-stone-200 text-xs font-mono font-bold">
                            {currentTime.toLocaleTimeString('vi-VN')} • {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </div>
                        <p className="text-[11px] text-amber-300 pt-1 border-t border-white/10">
                            ✨ Khu tự học Tầng 1 mở cửa 24/7
                        </p>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12">
                {/* ROOMS SCHEDULE TABLE */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-stone-900">
                                Khung Giờ Hoạt Động Theo Từng Khu Vực
                            </h2>
                            <p className="text-xs text-stone-500 mt-1">
                                Áp dụng trong suốt học kỳ chính quy (Thứ 2 đến Chủ Nhật)
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                            <Sparkles className="w-4 h-4 text-amber-600" />
                            <span>Mùa thi: Mở tăng cường đến 23:00</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {roomsSchedule.map((room, idx) => {
                            const Icon = room.icon;
                            return (
                                <div key={idx} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="p-3 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 shrink-0 mt-1">
                                            <Icon className="w-5 h-5 stroke-[2.2]" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-sm md:text-base font-black text-stone-900">
                                                    {room.name}
                                                </h3>
                                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${room.statusColor}`}>
                                                    {room.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-stone-500">
                                                {room.features}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 text-xs shrink-0 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-stone-100">
                                        <div>
                                            <span className="text-[11px] font-bold text-stone-400 block uppercase">Thứ 2 - Thứ 6:</span>
                                            <span className="font-extrabold text-stone-800">{room.hoursWeekdays}</span>
                                        </div>
                                        <div>
                                            <span className="text-[11px] font-bold text-stone-400 block uppercase">Thứ 7 & Chủ Nhật:</span>
                                            <span className="font-extrabold text-stone-800">{room.hoursWeekend}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* HOLIDAYS & MAINTENANCE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 text-stone-900 font-black text-base">
                            <Calendar className="w-5 h-5 text-amber-600" />
                            <span>Lịch Nghỉ Lễ & Thông Báo Đột Xuất</span>
                        </div>
                        <div className="divide-y divide-stone-100">
                            {upcomingHolidays.map((hol, idx) => (
                                <div key={idx} className="py-3.5 space-y-1 first:pt-0 last:pb-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className="font-bold text-stone-900 text-xs">{hol.name}</h4>
                                        <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md shrink-0">
                                            {hol.date}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-stone-500">{hol.note}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-stone-900 text-white rounded-3xl p-6 md:p-8 border border-stone-800 shadow-xl space-y-5 flex flex-col justify-between">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-amber-400 font-black text-base">
                                <HelpCircle className="w-5 h-5" />
                                <span>Cần Hỗ Trợ Khẩn Cấp Ngoài Giờ?</span>
                            </div>
                            <p className="text-xs text-stone-300 leading-relaxed">
                                Bạn gặp trục trặc khi quẹt thẻ vào phòng tự học 24/7, hộp trả sách tự động bị đầy hoặc cần xác nhận gấp thông tin lưu chiểu?
                            </p>
                            <div className="space-y-2 pt-2 text-xs font-medium text-stone-300">
                                <div className="flex items-center gap-2.5">
                                    <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                                    <span>Hotline Bảo Vệ & Trực Kỹ Thuật: <strong>1900 6868</strong> (Ext: 102)</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                                    <span>Email Tiếp Nhận: <strong>thuvien@daihoc.edu.vn</strong></span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                                    <span>Vị trí: Tòa nhà Thư Viện Trung Tâm - Khuôn viên chính</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-stone-800 flex gap-3">
                            <Link
                                to="/rules"
                                className="flex-1 text-center py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors"
                            >
                                Xem Quy Định Mượn Trả
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default SchedulePage;
