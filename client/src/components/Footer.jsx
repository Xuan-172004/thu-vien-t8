import React from 'react';
import { BookOpen, Phone, Mail, MapPin, ShieldCheck, Heart, Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-300 font-sans border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                <BookOpen className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Thư Viện<span className="text-amber-500"> Sách</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed font-medium">
              Nền tảng đọc sách & thư viện số thông minh hàng đầu. Mượn sách in miễn phí dành cho độc giả có Thẻ thư viện và tra cứu đồ án tốt nghiệp trực tuyến.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold bg-amber-950/60 border border-amber-900/60 px-3 py-1.5 rounded-xl w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span>Hệ thống Bảo mật & Bản quyền 100%</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-black uppercase text-white tracking-wider">Danh Mục Khám Phá</h4>
            <ul className="space-y-2 text-xs text-stone-400 font-medium">
              <li>
                <Link to="/" className="hover:text-amber-400 transition-colors">Tất cả kho sách in</Link>
              </li>
              <li>
                <Link to="/digital-docs" className="hover:text-amber-400 transition-colors text-amber-400 font-bold">Kho Tài Liệu Số & Đồ Án</Link>
              </li>
              <li>
                <Link to="/submit-thesis" className="hover:text-amber-400 transition-colors">Nộp Đồ Án Lưu Chiểu</Link>
              </li>
              <li>
                <Link to="/articles" className="hover:text-amber-400 transition-colors">Tin Tức & Sự Kiện</Link>
              </li>
              <li>
                <Link to="/my-rentals" className="hover:text-amber-400 transition-colors">Sổ mượn sách cá nhân</Link>
              </li>
            </ul>
          </div>

          {/* Opening Hours & Policy */}
          <div className="space-y-3">
            <h4 className="text-sm font-black uppercase text-white tracking-wider">Thông Tin & Quy Định</h4>
            <div className="space-y-2 text-xs text-stone-400 font-medium">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <Link to="/schedule" className="text-amber-300 font-bold hover:underline">Lịch phục vụ: 07:30 - 21:00 (24/7 Tầng 7)</Link>
              </div>
              <p>
                <Link to="/rules" className="hover:text-amber-400 transition-colors">Quy định mượn/trả sách & Cấp thẻ thư viện</Link>
              </p>
              <p>
                <Link to="/about" className="hover:text-amber-400 transition-colors">Giới thiệu lịch sử & Cơ sở vật chất Thư viện</Link>
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-black uppercase text-white tracking-wider">Thông Tin Liên Hệ</h4>
            <div className="space-y-2 text-xs text-stone-400 font-medium">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Tầng 7,Tòa nhà A8,Trường Đại học Giao Thông Vận Tải</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Hotline Hỗ Trợ: 1900 6868</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Email: hxuan1710@gmail.com</span>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-stone-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 ThuêSách247. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-1">
            <span>Phát triển với</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>cho cộng đồng độc giả Việt Nam</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
