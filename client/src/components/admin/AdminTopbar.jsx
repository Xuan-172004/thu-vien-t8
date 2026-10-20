import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, ExternalLink, ShieldCheck, Bell } from 'lucide-react';
import { Dropdown } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export default function AdminTopbar({ title = 'Quản Lý Người Dùng (Admin)' }) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification() || {};
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const adminMenuItems = [
    {
      key: 'profile',
      label: (
        <div className="py-1">
          <div className="font-bold text-stone-900">{user?.fullName || 'Quản trị viên'}</div>
          <div className="text-xs text-stone-400">{user?.email || 'admin@thuesach.vn'}</div>
          <span className="inline-block mt-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
            {user?.role || 'Admin'}
          </span>
        </div>
      )
    },
    { type: 'divider' },
    {
      key: 'portal',
      label: (
        <Link to="/" className="flex items-center gap-2 text-xs font-semibold text-stone-700">
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Về trang chủ đọc sách</span>
        </Link>
      )
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: (
        <div className="text-red-600 font-semibold flex items-center gap-2 text-xs py-0.5" onClick={handleLogout}>
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất Admin</span>
        </div>
      )
    }
  ];

  return (
    <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 font-sans shadow-2xs">
      
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
          <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
        </div>
        <div>
          <h1 className="text-lg md:text-xl font-extrabold text-stone-900 tracking-tight leading-none">
            {title}
          </h1>
          <p className="text-xs text-stone-400 font-medium mt-1">
            Giai đoạn 1.4: Tìm kiếm, phân quyền, cập nhật thông tin & khóa tài khoản người dùng
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        
        {/* Shortcut link to Reader Portal */}
        <Link 
          to="/" 
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-amber-600 bg-stone-100 hover:bg-amber-50 px-3.5 py-2 rounded-xl border border-stone-200 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Portal Bạn Đọc</span>
        </Link>

        {/* Real-time Notification Bell for Admin */}
        <Dropdown
          dropdownRender={() => (
            <div className="w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden font-sans">
              <div className="bg-stone-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span className="font-black text-sm">Thông Báo Quản Trị</span>
                  {(unreadCount || 0) > 0 && (
                    <span className="bg-amber-500 text-stone-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                      {unreadCount} mới
                    </span>
                  )}
                </div>
                {(unreadCount || 0) > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-bold text-amber-300 hover:text-amber-200 cursor-pointer"
                  >
                    Đã đọc tất cả
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 custom-scrollbar">
                {(!notifications || notifications.length === 0) ? (
                  <div className="p-8 text-center text-stone-400 text-xs font-bold">
                    Chưa có thông báo hệ thống mới!
                  </div>
                ) : (
                  notifications.slice(0, 6).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        if (!notif.isRead && markAsRead) markAsRead(notif.id);
                        if (notif.link) navigate(notif.link);
                      }}
                      className={`p-3.5 hover:bg-stone-50 transition-colors cursor-pointer flex items-start gap-3 ${
                        notif.isRead ? 'opacity-80' : 'bg-amber-50/40'
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" style={{ opacity: notif.isRead ? 0 : 1 }} />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h5 className="font-bold text-stone-900 text-xs truncate">
                          {notif.title}
                        </h5>
                        <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-stone-400 font-medium block pt-0.5">
                          {new Date(notif.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}, {new Date(notif.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 bg-stone-50 border-t border-stone-100 text-center">
                <button
                  onClick={() => navigate('/notifications')}
                  className="text-xs font-extrabold text-amber-700 hover:text-amber-800 cursor-pointer"
                >
                  Xem tất cả thông báo &rarr;
                </button>
              </div>
            </div>
          )}
          trigger={['click']}
          placement="bottomRight"
        >
          <button className="relative p-2.5 rounded-xl hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer border border-stone-200">
            <Bell className="w-4 h-4" />
            {(unreadCount || 0) > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-bounce">
                {(unreadCount || 0) > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </Dropdown>

        <div className="h-6 w-px bg-stone-200 hidden sm:block" />

        {/* Admin Account Dropdown */}
        <Dropdown menu={{ items: adminMenuItems }} trigger={['click']} placement="bottomRight">
          <button className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer border border-stone-200">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-400 font-extrabold flex items-center justify-center text-sm shadow-xs">
              {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-extrabold text-stone-900 leading-none">
                {user?.fullName || 'Quản trị viên'}
              </div>
              <div className="text-[10px] font-bold text-amber-600 uppercase leading-tight mt-0.5">
                {user?.role || 'Superadmin'}
              </div>
            </div>
          </button>
        </Dropdown>

      </div>

    </header>
  );
}
