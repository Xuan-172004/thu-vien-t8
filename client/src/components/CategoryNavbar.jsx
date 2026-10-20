import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Flame, Sparkles, Gift, Percent, Zap, ShieldCheck, GraduationCap, BookOpen, Newspaper, Clock, Building2 } from 'lucide-react';
import { Dropdown } from 'antd';

export default function CategoryNavbar({ selectedCategory, setSelectedCategory, categories }) {
  const activeCategories = Array.isArray(categories) ? categories : [];

  const categoryMenuItems = activeCategories.map(cat => ({
    key: cat.id || cat.slug || cat.name,
    label: (
      <div 
        className={`flex items-center justify-between py-1.5 px-2 gap-4 min-w-[220px] ${(selectedCategory === (cat.id || cat.slug || cat.name)) ? 'font-bold text-amber-600 bg-amber-50 rounded-lg' : 'hover:bg-stone-50 rounded-lg'}`}
        onClick={() => setSelectedCategory(cat.id || cat.slug || cat.name)}
      >
        <div className="flex items-center gap-2.5">
          {cat.image ? (
            <img src={cat.image} alt={cat.name} className="w-7 h-7 rounded-lg object-cover border border-stone-200 shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0">
              {cat.name.charAt(0)}
            </div>
          )}
          <span className="text-xs font-semibold">{cat.name}</span>
        </div>
        {cat.count !== undefined && <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full font-bold">{cat.count}</span>}
      </div>
    )
  }));

  const navLinks = [
    { id: 'digital-docs', label: 'Tài Liệu Số & Đồ Án', icon: GraduationCap, highlight: true, tag: 'Đọc 5 trang', isRoute: true, path: '/digital-docs' },
    { id: 'submit-thesis', label: 'Nộp Đồ Án', icon: Sparkles, tag: 'Lưu Chiểu', isRoute: true, path: '/submit-thesis' },
    { id: 'articles', label: 'Tin Tức & Sự Kiện', icon: Newspaper, isRoute: true, path: '/articles' },
    { id: 'schedule', label: 'Lịch Phục Vụ', icon: Clock, isRoute: true, path: '/schedule' },
    { id: 'rules', label: 'Hướng Dẫn & Quy Định', icon: ShieldCheck, isRoute: true, path: '/rules' },
    { id: 'about', label: 'Giới Thiệu', icon: Building2, isRoute: true, path: '/about' },
  ];

  return (
    <nav className="bg-white border-b border-stone-200 text-stone-700 text-xs md:text-sm font-medium">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between overflow-x-auto custom-scrollbar whitespace-nowrap gap-6 py-2.5">
        
        {/* Category Dropdown Trigger */}
        <Dropdown menu={{ items: categoryMenuItems }} trigger={['click']}>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-bold hover:bg-amber-100 transition-colors cursor-pointer shrink-0">
            <span>Tất cả thể loại</span>
            <ChevronDown className="w-4 h-4 text-amber-700 stroke-[2.5]" />
          </button>
        </Dropdown>

        {/* Links list */}
        <div className="flex items-center gap-6 text-stone-600">
          {navLinks.map((link) => {
            const IconComponent = link.icon;
            const linkContent = (
              <>
                {IconComponent && <IconComponent className={`w-4 h-4 ${link.highlight ? 'text-amber-600' : 'text-stone-400'}`} />}
                <span>{link.label}</span>
                {link.tag && (
                  <span className="bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {link.tag}
                  </span>
                )}
              </>
            );

            if (link.isRoute) {
              return (
                <Link
                  key={link.id}
                  to={link.path}
                  className={`flex items-center gap-1.5 py-1 hover:text-amber-600 transition-colors ${
                    link.highlight ? 'font-bold text-amber-600' : 'font-medium'
                  }`}
                >
                  {linkContent}
                </Link>
              );
            }

            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`flex items-center gap-1.5 py-1 hover:text-amber-600 transition-colors ${
                  link.highlight ? 'font-bold text-amber-600' : 'font-medium'
                }`}
              >
                {linkContent}
              </a>
            );
          })}
        </div>

        {/* Right Promo hint */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/60 font-semibold">
          <Zap className="w-3.5 h-3.5" />
          <span>Miễn phí giao sách từ 3 cuốn</span>
        </div>

      </div>
    </nav>
  );
}
