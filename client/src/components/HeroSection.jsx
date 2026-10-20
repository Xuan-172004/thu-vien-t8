import React from 'react';
import { 
    ArrowRight, 
    CreditCard, 
    Sparkles, 
    BookOpen, 
    ShieldCheck, 
    Zap, 
    TrendingUp, 
    Feather, 
    Compass, 
    Cpu, 
    Flame, 
    Code, 
    Brain,
    Layers
} from 'lucide-react';

const featuredHeroCards = [
    {
        id: 'van-hoc',
        categoryId: 'van-hoc',
        title: 'Văn Học & Nghệ Thuật',
        subtitle: 'Tiểu thuyết kinh điển, thơ ca & tản văn chọn lọc',
        tag: 'TOP DEALS',
        tagBg: 'bg-stone-900 text-amber-400',
        tagIcon: Flame,
        countText: '1.240+ đầu sách',
        gradient: 'from-amber-500/20 via-orange-500/10 to-rose-500/5',
        borderHover: 'hover:border-amber-400 hover:shadow-amber-500/15',
        iconBg: 'bg-gradient-to-tr from-amber-600 to-orange-500 text-white shadow-amber-500/25',
        MainIcon: Feather,
        SubIcon: BookOpen,
        accentColor: 'text-amber-600',
    },
    {
        id: 'kinh-te',
        categoryId: 'kinh-te',
        title: 'Kinh Tế & Quản Trị',
        subtitle: 'Khởi nghiệp, đầu tư tài chính & thuật lãnh đạo',
        tag: 'MỚI VỀ',
        tagBg: 'bg-emerald-700 text-white',
        tagIcon: Sparkles,
        countText: '850+ đầu sách',
        gradient: 'from-emerald-500/20 via-teal-500/10 to-cyan-500/5',
        borderHover: 'hover:border-emerald-400 hover:shadow-emerald-500/15',
        iconBg: 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/25',
        MainIcon: TrendingUp,
        SubIcon: ShieldCheck,
        accentColor: 'text-emerald-600',
    },
    {
        id: 'ky-nang',
        categoryId: 'ky-nang',
        title: 'Kỹ Năng & Tư Duy',
        subtitle: 'Phát triển bản thân, tư duy phản biện & giao tiếp',
        tag: 'TIẾT KIỆM 15%',
        tagBg: 'bg-gradient-to-r from-orange-600 to-amber-600 text-white',
        tagIcon: Zap,
        countText: '960+ đầu sách',
        gradient: 'from-purple-500/20 via-indigo-500/10 to-blue-500/5',
        borderHover: 'hover:border-purple-400 hover:shadow-purple-500/15',
        iconBg: 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-purple-500/25',
        MainIcon: Compass,
        SubIcon: Brain,
        accentColor: 'text-purple-600',
    },
    {
        id: 'cong-nghe',
        categoryId: 'cong-nghe',
        title: 'Sách Công Nghệ & AI',
        subtitle: 'Lập trình phần mềm, AI, dữ liệu lớn & kiến trúc',
        tag: 'XU HƯỚNG AI',
        tagBg: 'bg-indigo-700 text-cyan-300',
        tagIcon: Cpu,
        countText: '640+ đầu sách',
        gradient: 'from-blue-500/20 via-cyan-500/10 to-indigo-500/5',
        borderHover: 'hover:border-blue-400 hover:shadow-blue-500/15',
        iconBg: 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-blue-500/25',
        MainIcon: Cpu,
        SubIcon: Code,
        accentColor: 'text-blue-600',
    },
];

export default function HeroSection({ onSelectCategory, onOpenCardRegister }) {
    return (
        <section className="bg-gradient-to-b from-amber-500/5 via-stone-50/50 to-white pt-8 pb-14 px-4 md:px-8 border-b border-stone-200/80 font-sans relative overflow-hidden">
            {/* Ambient Background Blur Elements */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Top Badges & Online Reader Card CTA */}
                <div className="mb-5 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 bg-amber-100/90 text-amber-900 border border-amber-300/80 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide uppercase shadow-2xs">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                        <span>Hệ Thống Tủ Sách Trực Tuyến & Thư Viện Số</span>
                    </span>

                    <button
                        onClick={onOpenCardRegister}
                        className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-amber-400 border border-stone-800 px-4 py-1.5 rounded-full text-xs font-extrabold transition-all shadow-md hover:shadow-lg cursor-pointer group"
                    >
                        <CreditCard className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                        <span>Đăng ký Thẻ Thư Viện Điện Tử ngay &rarr;</span>
                    </button>
                </div>

                {/* Hero Main Header Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
                    <div className="lg:col-span-8 space-y-4">
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-stone-900 leading-[1.15] font-sans">
                            Tất cả sách cho học tập,
                            <br className="hidden sm:inline" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700">
                                Tri thức & Phát triển bản thân
                            </span>
                        </h1>
                        <p className="text-stone-600 text-base md:text-lg font-medium leading-relaxed max-w-2xl">
                            Khám phá hàng ngàn kho sách in miễn phí 100% cho hội viên có thẻ thư viện. Tra cứu đồ án tốt nghiệp, luận văn thạc sĩ và đọc thử <strong>5 trang đầu tiên hoàn toàn miễn phí</strong>.
                        </p>
                    </div>

                    {/* Stat Counter Highlights Row */}
                    <div className="lg:col-span-4 bg-white/90 backdrop-blur-md rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                        <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-lg font-black text-stone-900">10.000+ Đầu Sách</div>
                                <div className="text-xs text-stone-500 font-medium">Kho sách in & tài liệu số đa dạng</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-lg font-black text-emerald-700">0 VNĐ Phí Mượn Sách</div>
                                <div className="text-xs text-stone-500 font-medium">Dành cho độc giả có Thẻ Thư Viện</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-lg font-black text-purple-900">Đọc Thử 5 Trang PDF</div>
                                <div className="text-xs text-stone-500 font-medium">Trực tuyến cho Khách vãng lai</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4 Premium Feature Category Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredHeroCards.map((item) => {
                        const TagIcon = item.tagIcon;
                        const MainIcon = item.MainIcon;
                        const SubIcon = item.SubIcon;

                        return (
                            <div
                                key={item.id}
                                onClick={() => onSelectCategory(item.categoryId)}
                                className={`group bg-white rounded-3xl p-6 border border-stone-200/90 ${item.borderHover} hover:shadow-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer relative overflow-hidden`}
                            >
                                {/* Top Badge Row */}
                                <div className="flex items-center justify-between mb-3">
                                    <span
                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs ${item.tagBg}`}
                                    >
                                        <TagIcon className="w-3 h-3" />
                                        <span>{item.tag}</span>
                                    </span>

                                    <span className="text-[11px] font-bold text-stone-400 font-mono">
                                        {item.countText}
                                    </span>
                                </div>

                                {/* Rich Visual Graphic Hero Box */}
                                <div className={`w-full h-40 rounded-2xl bg-gradient-to-br ${item.gradient} border border-stone-100 flex flex-col items-center justify-center p-4 my-2 relative overflow-hidden group-hover:scale-[1.02] transition-all duration-300`}>
                                    {/* Ambient Glow Center */}
                                    <div className="w-20 h-20 rounded-full bg-white/40 blur-xl absolute" />

                                    {/* 3D-styled Layered Icon Graphics */}
                                    <div className="relative z-10 flex items-center justify-center">
                                        <div className={`w-16 h-16 rounded-2xl ${item.iconBg} flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform duration-300`}>
                                            <MainIcon className="w-8 h-8 stroke-[2.2]" />
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-white/90 shadow-md backdrop-blur-xs flex items-center justify-center text-stone-700 border border-stone-200">
                                            <SubIcon className="w-4 h-4" />
                                        </div>
                                    </div>

                                    <span className="text-[10px] font-extrabold tracking-widest text-stone-400 uppercase mt-4 font-mono">
                                        TỦ SÁCH CHUYÊN ĐỀ
                                    </span>
                                </div>

                                {/* Card Footer Content */}
                                <div className="space-y-1.5 pt-3">
                                    <h3 className="text-base font-black text-stone-900 group-hover:text-amber-600 transition-colors leading-snug">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-stone-500 font-medium line-clamp-2 leading-relaxed">
                                        {item.subtitle}
                                    </p>
                                    <div className={`pt-2 flex items-center gap-1.5 text-xs font-black ${item.accentColor} group-hover:translate-x-1 transition-transform`}>
                                        <span>Khám phá kho sách</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
