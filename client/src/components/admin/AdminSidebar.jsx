import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  CreditCard, 
  Repeat, 
  BarChart3, 
  ShieldAlert, 
  ChevronRight, 
  BookMarked,
  Layers,
  Barcode,
  Sparkles,
  FileCheck,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function AdminSidebar() {
  const location = useLocation();

  const menuItems = [
    {
      key: 'dashboard',
      label: 'Tổng Quan & Thống Kê',
      icon: BarChart3,
      path: '/admin',
      active: location.pathname === '/admin' || location.pathname === '/admin/dashboard',
      badge: 'Live',
      badgeColor: 'bg-emerald-500 text-stone-950 font-black',
    },
    {
      key: 'user-management',
      label: 'Quản Lý Người Dùng',
      icon: Users,
      path: '/admin/users',
      active: location.pathname === '/admin/users',
      badge: 'Thành Viên',
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    },
    {
      key: 'cards-management',
      label: 'Quản Lý Thẻ Thư Viện',
      icon: CreditCard,
      path: '/admin/cards',
      active: location.pathname === '/admin/cards',
      badge: 'Thẻ Độc Giả',
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    },
    {
      key: 'books-management',
      label: 'Quản Lý Kho Sách',
      icon: BookMarked,
      path: '/admin/books',
      active: location.pathname === '/admin/books',
      badge: 'Kho Sách',
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    },
    {
      key: 'categories-management',
      label: 'Quản Lý Danh Mục',
      icon: Layers,
      path: '/admin/categories',
      active: location.pathname === '/admin/categories',
      badge: 'Thể Loại',
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    },
    {
      key: 'inventory-management',
      label: 'Quản Lý Kho & ĐKCB',
      icon: Barcode,
      path: '/admin/inventory',
      active: location.pathname === '/admin/inventory',
      badge: 'ĐKCB',
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    },
    {
      key: 'digital-docs-management',
      label: 'Tài Liệu Số & Đồ Án',
      icon: FileCheck,
      path: '/admin/digital-docs',
      active: location.pathname === '/admin/digital-docs',
      badge: 'Đồ Án PDF',
      badgeColor: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    },
    {
      key: 'policies-management',
      label: 'Cấu Hình Mượn & Phạt',
      icon: ShieldAlert,
      path: '/admin/policies',
      active: location.pathname === '/admin/policies',
      badge: 'Chính Sách',
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    },
    {
      key: 'rentals-management',
      label: 'Quản Lý Mượn - Trả',
      icon: Repeat,
      path: '/admin/rentals',
      active: location.pathname === '/admin/rentals',
      badge: 'Mượn Trả',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      key: 'articles-management',
      label: 'Tin Tức & Bài Viết',
      icon: BookOpen,
      path: '/admin/articles',
      active: location.pathname === '/admin/articles',
      badge: 'Bài Viết',
      badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    },
  ];

  return (
    <aside className="w-72 bg-stone-950 text-stone-300 h-screen sticky top-0 flex flex-col justify-between border-r border-stone-800/80 shrink-0 font-sans z-30 shadow-2xl">
      
      <div>
        {/* Admin Header Logo */}
        <div className="p-5 border-b border-stone-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <BookOpen className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-white font-sans">
                  Thư Viện<span className="text-amber-500"> Sách</span>
                </span>
                <span className="bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] text-stone-500 font-medium">Hệ thống quản trị thư viện sách</p>
            </div>
          </div>
        </div>

        {/* Navigation Group Title */}
        <div className="px-5 pt-6 pb-2 text-[10px] font-black uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          <span>Phân Hệ Quản Trị Thư Viện</span>
        </div>

        {/* Menu Items */}
        <nav className="px-3 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isCurrent = item.active;

            return (
              <Link
                key={item.key}
                to={item.path}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                  isCurrent
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-lg shadow-amber-500/20 font-black'
                    : 'text-stone-300 hover:bg-stone-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-stone-950 stroke-[2.5]' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status Info */}
      <div className="p-4 m-3 rounded-2xl bg-stone-900/90 border border-stone-800 text-xs space-y-1">
        <div className="flex items-center justify-between text-amber-400 font-bold">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 fill-amber-400" />
            <span>Trạng Thái Hệ Thống</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <p className="text-[11px] text-stone-400 leading-snug">
          MySQL Database Online • Đã đồng bộ real-time.
        </p>
      </div>

    </aside>
  );
}
