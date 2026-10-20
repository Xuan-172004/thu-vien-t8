import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Breadcrumb, Tag, Button, Spin, Empty, Popconfirm, Select, Modal } from 'antd';
import {
    Bell,
    CheckCircle2,
    Clock,
    CreditCard,
    BookOpen,
    GraduationCap,
    FileText,
    AlertTriangle,
    ShieldAlert,
    Trash2,
    Check,
    Send,
    Layers,
    Sparkles,
    ArrowRight,
    Mail,
} from 'lucide-react';

import TopHeader from '../../components/TopHeader';
import MainHeader from '../../components/MainHeader';
import CategoryNavbar from '../../components/CategoryNavbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { sendTestNotificationApi } from '../../api/notification.api';
import { sendTestEmailApi } from '../../api/email.api';
import { showToast } from '../../utils/toast';

const categoryLabels = {
    all: 'Tất cả thông báo',
    card: 'Thẻ Thư Viện',
    rental: 'Phiếu Mượn & Trả Sách',
    extension: 'Gia Hạn Sách',
    due_reminder: 'Nhắc Hạn Trả Sách',
    overdue: 'Quá Hạn & Tiền Phạt',
    purchase: 'Bản Quyền Tài Liệu Số',
    thesis_approval: 'Đồ Án / Luận Văn Lưu Chiểu',
    system: 'Hệ Thống',
};

const getCategoryIcon = (category, type) => {
    switch (category) {
        case 'card':
            return <CreditCard className="w-5 h-5 text-indigo-500" />;
        case 'rental':
            return <BookOpen className="w-5 h-5 text-amber-500" />;
        case 'extension':
            return <Clock className="w-5 h-5 text-blue-500" />;
        case 'due_reminder':
            return <AlertTriangle className="w-5 h-5 text-amber-600" />;
        case 'overdue':
            return <ShieldAlert className="w-5 h-5 text-rose-500" />;
        case 'purchase':
            return <FileText className="w-5 h-5 text-emerald-500" />;
        case 'thesis_approval':
            return <GraduationCap className="w-5 h-5 text-purple-500" />;
        default:
            return <Bell className="w-5 h-5 text-stone-500" />;
    }
};

export function NotificationsPage() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    } = useNotification();

    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'unread' | 'read'
    const [testMode, setTestMode] = useState('email'); // 'socket' | 'email'
    const [testModalOpen, setTestModalOpen] = useState(false);
    const [testSending, setTestSending] = useState(false);
    const [testType, setTestType] = useState('card');
    const [testEmailType, setTestEmailType] = useState('welcome');
    const [targetEmail, setTargetEmail] = useState(user?.email || '');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth');
        } else {
            fetchNotifications({ page: 1, limit: 50 });
            if (user?.email) setTargetEmail(user.email);
        }
    }, [isAuthenticated, fetchNotifications, navigate, user?.email]);

    // Client-side filtering
    const filteredNotifications = notifications.filter((notif) => {
        const matchCategory = selectedCategory === 'all' || notif.category === selectedCategory;
        const matchStatus =
            selectedStatus === 'all' ||
            (selectedStatus === 'unread' && !notif.isRead) ||
            (selectedStatus === 'read' && notif.isRead);
        return matchCategory && matchStatus;
    });

    const handleSendTestDemo = async () => {
        setTestSending(true);
        try {
            if (testMode === 'email') {
                const res = await sendTestEmailApi({
                    templateType: testEmailType,
                    targetEmail: targetEmail || user?.email,
                });
                showToast.success(res.message || 'Đã gửi Email giao dịch thành công! Hãy kiểm tra hòm thư của bạn.');
                setTestModalOpen(false);
            } else {
                let testPayload = {};
                switch (testType) {
                    case 'card':
                        testPayload = {
                            title: 'Thẻ Thư Viện Đã Được Duyệt!',
                            message: `Hồ sơ thẻ sinh viên của ${user?.fullName || 'bạn'} đã được cấp thành công. Mã thẻ: CARD-2026-${Math.floor(1000 + Math.random() * 9000)}.`,
                            type: 'success',
                            category: 'card',
                            link: '/profile',
                        };
                        break;
                    case 'rental':
                        testPayload = {
                            title: 'Phiếu Mượn Sách Sẵn Sàng Nhận Tại Quầy!',
                            message: `Phiếu mượn PM-2026-${Math.floor(1000 + Math.random() * 9000)} đã được thủ thư xếp sách xong. Vui lòng mang thẻ thư viện đến nhận.`,
                            type: 'success',
                            category: 'rental',
                            link: '/my-rentals',
                        };
                        break;
                    case 'thesis':
                        testPayload = {
                            title: 'Đồ Án Tốt Nghiệp Đã Được Xuất Bản Lưu Chiểu!',
                            message: 'Đề tài Khóa luận tốt nghiệp của bạn đã được duyệt và cấp mã THESIS-2026-888 thành công.',
                            type: 'success',
                            category: 'thesis_approval',
                            link: '/submit-thesis',
                        };
                        break;
                    case 'overdue':
                        testPayload = {
                            title: 'Cảnh Báo: Sách Sắp Đến Hạn Trả (Còn 2 Ngày)!',
                            message: 'Sách "Lập trình Web với React & Node.js" sẽ hết hạn mượn vào ngày mai. Vui lòng gia hạn hoặc trả sách đúng hạn.',
                            type: 'warning',
                            category: 'due_reminder',
                            link: '/my-rentals',
                        };
                        break;
                    default:
                        testPayload = {
                            title: 'Thông Báo Thư Viện Mới',
                            message: 'Thư viện sẽ mở cửa phục vụ xuyên suốt kỳ thi từ 7:30 đến 21:00 hàng ngày.',
                            type: 'info',
                            category: 'system',
                            link: '/notifications',
                        };
                }

                await sendTestNotificationApi(testPayload);
                setTestModalOpen(false);
                showToast.success('Đã phát Socket.IO Real-time thành công! Hãy quan sát chuông thông báo.');
            }
        } catch (err) {
            showToast.error(err.message || 'Gửi thông báo / email test thất bại');
        } finally {
            setTestSending(false);
        }
    };

    const formatTimeAgo = (dateStr) => {
        if (!dateStr) return 'Mới đây';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays === 1) return 'Hôm qua';
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div className="min-h-screen bg-[#faf9f6] text-stone-800 flex flex-col font-sans">
            <TopHeader />
            <MainHeader />
            <CategoryNavbar />

            {/* Breadcrumb Bar */}
            <div className="bg-white border-b border-stone-200 px-4 md:px-8 py-3">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Breadcrumb
                        items={[
                            { title: <Link to="/" className="text-stone-500 hover:text-stone-800 text-xs">Trang chủ</Link> },
                            { title: <span className="text-amber-800 font-bold text-xs">Trung Tâm Thông Báo</span> },
                        ]}
                    />

                    <div className="flex items-center gap-2">
                        <Tag color="amber" className="font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                            {unreadCount} chưa đọc
                        </Tag>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-6 space-y-6">
                
                {/* Header Banner */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 text-xs font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Real-Time WebSocket In-App Notifications</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-stone-900">
                            Trung Tâm Thông Báo Của Bạn
                        </h1>
                        <p className="text-xs md:text-sm text-stone-500 max-w-xl">
                            Cập nhật tức thì trạng thái duyệt thẻ thư viện, phiếu mượn sách, gia hạn, tài liệu số và đồ án tốt nghiệp nộp lưu chiểu.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {unreadCount > 0 && (
                            <Button
                                icon={<Check className="w-4 h-4" />}
                                onClick={markAllAsRead}
                                className="rounded-xl font-bold text-xs h-10 px-4 bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                            >
                                Đánh dấu tất cả đã đọc
                            </Button>
                        )}
                        <Button
                            type="primary"
                            icon={<Send className="w-4 h-4" />}
                            onClick={() => setTestModalOpen(true)}
                            className="rounded-xl font-black text-xs h-10 px-5 bg-stone-900 hover:bg-stone-800 border-none shadow-sm"
                        >
                            Bắn Thông Báo Realtime Demo
                        </Button>
                    </div>
                </div>

                {/* Filter Pills Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 md:p-4 rounded-2xl border border-stone-200">
                    <div className="flex flex-wrap items-center gap-2 overflow-x-auto">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                                selectedCategory === 'all'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                        >
                            Tất cả ({notifications.length})
                        </button>
                        {['card', 'rental', 'thesis_approval', 'purchase', 'due_reminder'].map((catKey) => {
                            const count = notifications.filter((n) => n.category === catKey).length;
                            return (
                                <button
                                    key={catKey}
                                    onClick={() => setSelectedCategory(catKey)}
                                    className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                                        selectedCategory === catKey
                                            ? 'bg-amber-600 text-white shadow-xs'
                                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                    }`}
                                >
                                    {categoryLabels[catKey]} {count > 0 ? `(${count})` : ''}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-400 font-bold">Lọc trạng thái:</span>
                        <Select
                            value={selectedStatus}
                            onChange={setSelectedStatus}
                            style={{ width: 130 }}
                            className="text-xs"
                            options={[
                                { value: 'all', label: 'Tất cả' },
                                { value: 'unread', label: 'Chưa đọc' },
                                { value: 'read', label: 'Đã đọc' },
                            ]}
                        />
                    </div>
                </div>

                {/* Notification Items List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-3">
                            <Spin size="large" />
                            <div className="text-xs font-bold text-stone-400">Đang đồng bộ thông báo thời gian thực...</div>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="bg-white p-16 rounded-3xl border border-stone-200 text-center">
                            <Empty
                                description={
                                    <span className="text-stone-400 text-xs font-bold">
                                        Không có thông báo nào trong danh mục này!
                                    </span>
                                }
                            />
                        </div>
                    ) : (
                        filteredNotifications.map((notif) => (
                            <div
                                key={notif.id}
                                onClick={() => {
                                    if (!notif.isRead) markAsRead(notif.id);
                                    if (notif.link) navigate(notif.link);
                                }}
                                className={`group p-4 md:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                                    notif.isRead
                                        ? 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-xs'
                                        : 'bg-amber-50/40 border-amber-300 hover:bg-amber-50/70 shadow-2xs'
                                }`}
                            >
                                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                                    <div
                                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                                            notif.isRead ? 'bg-stone-100 border-stone-200' : 'bg-white border-amber-300 shadow-2xs'
                                        }`}
                                    >
                                        {getCategoryIcon(notif.category, notif.type)}
                                    </div>

                                    <div className="space-y-1 flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Tag
                                                color={
                                                    notif.category === 'card'
                                                        ? 'indigo'
                                                        : notif.category === 'rental'
                                                        ? 'gold'
                                                        : notif.category === 'thesis_approval'
                                                        ? 'purple'
                                                        : notif.category === 'purchase'
                                                        ? 'emerald'
                                                        : 'default'
                                                }
                                                className="font-bold text-[10px] uppercase px-2 py-0 rounded-md m-0"
                                            >
                                                {categoryLabels[notif.category] || 'Hệ thống'}
                                            </Tag>
                                            <span className="text-[11px] text-stone-400 font-medium">
                                                {formatTimeAgo(notif.createdAt)}
                                            </span>
                                            {!notif.isRead && (
                                                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                                            )}
                                        </div>

                                        <h4
                                            className={`text-sm md:text-base font-black truncate leading-snug ${
                                                notif.isRead ? 'text-stone-800' : 'text-amber-950'
                                            }`}
                                        >
                                            {notif.title}
                                        </h4>

                                        <p className="text-xs text-stone-600 leading-relaxed font-sans line-clamp-2">
                                            {notif.message}
                                        </p>

                                        {notif.link && (
                                            <div className="pt-1 inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 group-hover:text-amber-800">
                                                <span>Xem chi tiết nghiệp vụ</span>
                                                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                    {!notif.isRead && (
                                        <Button
                                            size="small"
                                            type="text"
                                            icon={<Check className="w-3.5 h-3.5 text-stone-400 hover:text-emerald-600" />}
                                            onClick={() => markAsRead(notif.id)}
                                            title="Đánh dấu đã đọc"
                                        />
                                    )}
                                    <Popconfirm
                                        title="Xóa thông báo này?"
                                        onConfirm={() => deleteNotification(notif.id)}
                                        okText="Xóa"
                                        cancelText="Hủy"
                                    >
                                        <Button
                                            size="small"
                                            type="text"
                                            danger
                                            icon={<Trash2 className="w-3.5 h-3.5 text-stone-400 hover:text-rose-600" />}
                                            title="Xóa"
                                        />
                                    </Popconfirm>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* DEMO TEST MODAL FOR EMAIL & SOCKET.IO */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-stone-900 font-black text-base">
                        {testMode === 'email' ? <Mail className="w-5 h-5 text-amber-600" /> : <Send className="w-5 h-5 text-amber-600" />}
                        <span>Thử Nghiệm Giao Dịch: Email & Socket.IO</span>
                    </div>
                }
                open={testModalOpen}
                onCancel={() => setTestModalOpen(false)}
                footer={null}
                width={600}
                className="rounded-3xl"
            >
                <div className="space-y-4 pt-2 text-xs text-stone-600">
                    {/* Mode Switch Pills */}
                    <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-2xl">
                        <button
                            type="button"
                            onClick={() => setTestMode('email')}
                            className={`flex-1 py-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                testMode === 'email'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'text-stone-600 hover:text-stone-900'
                            }`}
                        >
                            <Mail className="w-3.5 h-3.5" /> Gửi Email Giao Dịch (8 Mẫu)
                        </button>
                        <button
                            type="button"
                            onClick={() => setTestMode('socket')}
                            className={`flex-1 py-2 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                testMode === 'socket'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'text-stone-600 hover:text-stone-900'
                            }`}
                        >
                            <Send className="w-3.5 h-3.5" /> Bắn Socket.IO Real-time
                        </button>
                    </div>

                    {testMode === 'email' ? (
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="font-bold text-stone-800 text-xs">Email người nhận thử nghiệm:</label>
                                <input
                                    type="email"
                                    value={targetEmail}
                                    onChange={(e) => setTargetEmail(e.target.value)}
                                    placeholder="nhap-email-cua-ban@gmail.com"
                                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:outline-amber-600"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-bold text-stone-800 text-xs">Chọn 1 trong 8 mẫu Email giao dịch Thư viện:</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {[
                                        { key: 'welcome', label: '1. Chào Mừng Kích Hoạt', desc: 'Thư kích hoạt tài khoản' },
                                        { key: 'otp_register', label: '2. Mã OTP Đăng Ký / Quên MK', desc: 'Mã PIN OTP 6 số bảo mật' },
                                        { key: 'card_approval', label: '3. Duyệt Thẻ Thư Viện', desc: 'Mã thẻ & Hạn mức mượn' },
                                        { key: 'borrow_approval', label: '4. Duyệt Phiếu Mượn Sách', desc: 'Mã phiếu & Hạn nhận tại quầy' },
                                        { key: 'due_reminder', label: '5. Nhắc Hạn Trả Sách', desc: 'Cảnh báo trước 2 ngày' },
                                        { key: 'overdue_warning', label: '6. Cảnh Báo Quá Hạn & Phạt', desc: 'Số ngày trễ & tiền phạt' },
                                        { key: 'digital_doc_purchase', label: '7. Hóa Đơn Tài Liệu Số', desc: 'Mở khóa đọc & Tải PDF' },
                                        { key: 'thesis_approval', label: '8. Duyệt Đồ Án Lưu Chiểu', desc: 'Mã THESIS & link xuất bản' },
                                    ].map((m) => (
                                        <button
                                            key={m.key}
                                            type="button"
                                            onClick={() => setTestEmailType(m.key)}
                                            className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer space-y-0.5 ${
                                                testEmailType === m.key
                                                    ? 'bg-amber-50 border-amber-500 text-amber-950 shadow-2xs'
                                                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                                            }`}
                                        >
                                            <div className="font-extrabold text-xs">{m.label}</div>
                                            <div className="text-[10px] text-stone-500">{m.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2.5">
                            <p className="leading-relaxed">
                                Chọn một kịch bản thông báo nghiệp vụ dưới đây để Backend phát sự kiện WebSocket trực tiếp tới trình duyệt:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {[
                                    { key: 'card', label: 'Duyệt Thẻ Thư Viện', icon: <CreditCard className="w-4 h-4 text-indigo-500" /> },
                                    { key: 'rental', label: 'Duyệt Phiếu Mượn Sách', icon: <BookOpen className="w-4 h-4 text-amber-500" /> },
                                    { key: 'thesis', label: 'Duyệt Đồ Án Lưu Chiểu', icon: <GraduationCap className="w-4 h-4 text-purple-500" /> },
                                    { key: 'overdue', label: 'Cảnh Báo Sắp Đến Hạn', icon: <AlertTriangle className="w-4 h-4 text-rose-500" /> },
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => setTestType(item.key)}
                                        className={`p-3 rounded-2xl border flex items-center gap-2.5 font-bold transition-all text-left cursor-pointer ${
                                            testType === item.key
                                                ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-2xs'
                                                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                                        }`}
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-3 border-t border-stone-100">
                        <Button onClick={() => setTestModalOpen(false)} className="rounded-xl font-bold text-xs h-10 px-5">
                            Đóng
                        </Button>
                        <Button
                            type="primary"
                            loading={testSending}
                            onClick={handleSendTestDemo}
                            className="bg-amber-600 hover:bg-amber-700 border-none font-bold text-xs h-10 px-6 rounded-xl shadow-sm cursor-pointer"
                        >
                            {testMode === 'email' ? 'Gửi Email Ngay' : 'Phát WebSocket Ngay'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <Footer />
        </div>
    );
}

export default NotificationsPage;
