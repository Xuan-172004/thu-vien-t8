import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  CreditCard, 
  BookOpen, 
  RotateCcw, 
  Sparkles, 
  GraduationCap, 
  Clock, 
  ShieldCheck, 
  Wifi, 
  CheckCircle2, 
  ArrowRight,
  Layers,
  Laptop
} from 'lucide-react';
import { Button } from 'antd';

export default function LibraryGuideSection({ onOpenCardModal }) {
  const steps = [
    {
      step: '01',
      title: 'Tra Cứu Trực Tuyến',
      desc: 'Tìm kiếm tài liệu, sách in hoặc đề tài đồ án cần mượn và bấm Thêm Vào Giỏ Mượn.',
      icon: Search,
      badge: 'Tìm kiếm nhanh',
      accent: 'from-amber-500 to-orange-500',
    },
    {
      step: '02',
      title: 'Xuất Trình Thẻ Điện Tử',
      desc: 'Mở Thẻ Thư Viện Điện Tử trên điện thoại và quét mã QR tại quầy thủ thư trong 30 giây.',
      icon: CreditCard,
      badge: 'Quét mã 30s',
      accent: 'from-blue-600 to-cyan-500',
    },
    {
      step: '03',
      title: 'Nhận Sách Miễn Phí',
      desc: 'Mượn đọc tại phòng đọc hoặc mang về nhà từ 14 đến 30 ngày hoàn toàn miễn phí 0 VNĐ.',
      icon: BookOpen,
      badge: '0 VNĐ Phí mượn',
      accent: 'from-emerald-600 to-teal-500',
    },
    {
      step: '04',
      title: 'Gia Hạn & Trả Sách 24/7',
      desc: 'Gia hạn hạn trả trực tuyến trên trang cá nhân hoặc trả sách tại thùng tiếp nhận tự động 24h.',
      icon: RotateCcw,
      badge: 'Tự động 24/7',
      accent: 'from-purple-600 to-indigo-500',
    },
  ];

  const facilities = [
    {
      icon: GraduationCap,
      title: 'Kho Tài Liệu Số & Đồ Án',
      desc: 'Tra cứu hàng ngàn đồ án tốt nghiệp, luận văn thạc sĩ và đọc thử 5 trang PDF miễn phí.',
      tag: 'Tài liệu số',
      link: '/digital-docs',
      linkText: 'Xem tài liệu số',
    },
    {
      icon: Clock,
      title: 'Hệ Thống Trả Sách Tự Động 24/7',
      desc: 'Hộp trả sách tự động phục vụ suốt 24/7 ngay cổng thư viện, không lo trễ hạn trả.',
      tag: 'Tiện ích 24h',
    },
    {
      icon: ShieldCheck,
      title: 'Thẻ Thư Viện Điện Tử Thông Minh',
      desc: 'Tích hợp mã số độc giả MB-2026, theo dõi hạn trả sách và bảo toàn 100% tiền cọc.',
      tag: 'Thẻ điện tử',
      action: onOpenCardModal,
      actionText: 'Kích hoạt thẻ ngay',
    },
    {
      icon: Wifi,
      title: 'Không Gian Học Tập & Wi-Fi Miễn Phí',
      desc: 'Phòng đọc yên tĩnh, khu vực làm việc nhóm và hệ thống máy tính tra cứu OPAC hiện đại.',
      tag: 'Phòng đọc',
    },
  ];

  return (
    <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto font-sans" id="library-guide">
      
      {/* 1. WORKFLOW GUIDE HEADER */}
      <div className="bg-stone-900 text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden border border-stone-800 mb-12">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 text-amber-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Quy Trình Phục Vụ Bạn Đọc</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Mượn Sách & Tra Cứu Thư Viện Thật Dễ Dàng
          </h2>
          <p className="text-stone-300 text-xs sm:text-sm md:text-base leading-relaxed">
            Hệ thống thư viện điện tử kết hợp kho sách in truyền thống, mang lại trải nghiệm học tập và nghiên cứu tiện lợi nhất.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="bg-stone-950/80 border border-stone-800/90 hover:border-amber-500/60 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 group"
              >
                <div className="space-y-4">
                  {/* Step number & Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-mono font-black text-stone-600 group-hover:text-amber-400 transition-colors">
                      {item.step}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 group-hover:bg-amber-500/20 group-hover:text-amber-300 transition-colors">
                      {item.badge}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.accent} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 stroke-[2.2]" />
                  </div>

                  {/* Title & Desc */}
                  <div className="space-y-1.5 pt-1">
                    <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-stone-400 font-medium leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-800/80 flex items-center gap-1.5 text-[11px] font-bold text-amber-500/80 group-hover:text-amber-400">
                  <span>Bước {idx + 1}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA bar inside dark box */}
        <div className="mt-12 pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left relative z-10">
          <div>
            <div className="text-sm font-black text-white">Bạn chưa có Thẻ Thư Viện Điện Tử?</div>
            <div className="text-xs text-stone-400 font-medium mt-0.5">
              Đăng ký trực tuyến hoàn toàn miễn phí chỉ trong 1 phút bằng mã số sinh viên / CCCD.
            </div>
          </div>

          <button
            onClick={onOpenCardModal}
            className="px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2 shrink-0 group"
          >
            <CreditCard className="w-4 h-4 text-amber-200 group-hover:scale-110 transition-transform" />
            <span>Kích Hoạt Thẻ Thư Viện Ngay &rarr;</span>
          </button>
        </div>
      </div>

      {/* 2. MODERN LIBRARY FACILITIES GRID */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-amber-600 font-black text-xs uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Tiện Ích & Dịch Vụ Thư Viện</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
              Hệ Thống Tiện Ích Phục Vụ Nghiên Cứu
            </h2>
          </div>
          <p className="text-xs text-stone-500 font-medium max-w-md">
            Môi trường học thuật chuẩn quốc tế kết hợp công nghệ chuyển đổi số hiện đại.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilities.map((fac, idx) => {
            const Icon = fac.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-stone-200/90 hover:border-amber-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2.5 py-0.5 rounded-full uppercase">
                      {fac.tag}
                    </span>
                  </div>

                  <h3 className="font-black text-stone-900 text-sm group-hover:text-amber-700 transition-colors leading-snug">
                    {fac.title}
                  </h3>

                  <p className="text-xs text-stone-500 font-medium leading-relaxed">
                    {fac.desc}
                  </p>
                </div>

                {fac.link ? (
                  <Link
                    to={fac.link}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-amber-700 hover:text-amber-800 pt-2 border-t border-stone-100"
                  >
                    <span>{fac.linkText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : fac.action ? (
                  <button
                    onClick={fac.action}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-amber-700 hover:text-amber-800 pt-2 border-t border-stone-100 cursor-pointer text-left"
                  >
                    <span>{fac.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <div className="pt-2 border-t border-stone-100 flex items-center gap-1.5 text-xs font-bold text-stone-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sẵn sàng phục vụ</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}
