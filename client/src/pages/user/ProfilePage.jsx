import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Tag, Tabs, Card, Table, Empty, Spin, Avatar, Badge, Tooltip } from 'antd';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Lock,
    ShieldCheck,
    CreditCard,
    Wallet,
    BookOpen,
    FileCheck,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    Eye,
    Sparkles,
    KeyRound,
    ArrowLeft,
    LogOut,
} from 'lucide-react';

import MainHeader from '../../components/MainHeader';
import CategoryNavbar from '../../components/CategoryNavbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import { updateProfileApi, changePasswordApi } from '../../api/auth.api';
import { getMyRentalOrdersApi } from '../../api/rentalUser.api';
import { getMyPurchasedDigitalDocsApi } from '../../api/digitalDocReader.api';
import ReaderCardModal from '../../components/card/ReaderCardModal';
import WalletDepositModal from '../../components/user/WalletDepositModal';
import { showToast } from '../../utils/toast';
import dayjs from 'dayjs';

export function ProfilePage() {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout, setUser } = useAuth();
    const [profileForm] = Form.useForm();
    const [passwordForm] = Form.useForm();

    const [updatingProfile, setUpdatingProfile] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const [cardModalVisible, setCardModalVisible] = useState(false);
    const [depositModalVisible, setDepositModalVisible] = useState(false);

    const [rentals, setRentals] = useState([]);
    const [loadingRentals, setLoadingRentals] = useState(false);

    const [purchases, setPurchases] = useState([]);
    const [loadingPurchases, setLoadingPurchases] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth');
            return;
        }

        if (user) {
            profileForm.setFieldsValue({
                fullName: user.fullName || '',
                phone: user.phone || '',
                address: user.address || '',
                email: user.email || '',
                avatar: user.avatar || '',
            });
        }

        fetchRentals();
        fetchPurchases();
    }, [isAuthenticated, user]);

    const fetchRentals = async () => {
        setLoadingRentals(true);
        try {
            const res = await getMyRentalOrdersApi();
            const list = res.metadata?.orders || res.data || [];
            setRentals(Array.isArray(list) ? list : []);
        } catch (err) {
            console.warn('Fetch my rentals error:', err);
        } finally {
            setLoadingRentals(false);
        }
    };

    const fetchPurchases = async () => {
        setLoadingPurchases(true);
        try {
            const res = await getMyPurchasedDigitalDocsApi();
            const list = res.metadata || res.data || [];
            setPurchases(Array.isArray(list) ? list : []);
        } catch (err) {
            console.warn('Fetch my purchases error:', err);
        } finally {
            setLoadingPurchases(false);
        }
    };

    const handleUpdateProfile = async (values) => {
        setUpdatingProfile(true);
        try {
            const res = await updateProfileApi(values);
            const updatedUser = res.metadata || { ...user, ...values };
            if (setUser) setUser(updatedUser);
            showToast.success('Cập nhật thông tin cá nhân thành công!');
        } catch (err) {
            showToast.error(err.response?.data?.message || err.message || 'Không thể cập nhật hồ sơ!');
        } finally {
            setUpdatingProfile(false);
        }
    };

    const handleChangePassword = async (values) => {
        if (values.newPassword !== values.confirmPassword) {
            showToast.warning('Mật khẩu mới và xác nhận mật khẩu không khớp!');
            return;
        }

        setChangingPassword(true);
        try {
            await changePasswordApi({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });
            showToast.success('Đổi mật khẩu tài khoản thành công!');
            passwordForm.resetFields();
        } catch (err) {
            showToast.error(err.response?.data?.message || err.message || 'Lỗi khi đổi mật khẩu!');
        } finally {
            setChangingPassword(false);
        }
    };

    const rentalColumns = [
        {
            title: 'Mã Phiếu',
            dataIndex: 'orderCode',
            key: 'orderCode',
            render: (text) => <span className="font-mono font-black text-amber-900 text-xs">{text}</span>,
        },
        {
            title: 'Ngày Mượn & Hạn Trả',
            key: 'dates',
            render: (_, r) => (
                <div className="text-xs space-y-0.5">
                    <div>Mượn: {dayjs(r.pickupDate || r.createdAt).format('DD/MM/YYYY')}</div>
                    <div className="font-bold text-stone-900">Hạn: {dayjs(r.dueDate).format('DD/MM/YYYY')}</div>
                </div>
            ),
        },
        {
            title: 'Số Lượng',
            key: 'items',
            render: (_, r) => <span className="font-bold text-xs">{r.items?.length || 1} cuốn sách</span>,
        },
        {
            title: 'Trạng Thái',
            key: 'status',
            render: (_, r) => {
                const statusMap = {
                    Pending: { label: 'Chờ Duyệt Online', color: 'amber' },
                    Approved: { label: 'Đã Duyệt (Sẵn Sàng Lấy)', color: 'blue' },
                    Rented: { label: 'Đang Mượn Đọc', color: 'emerald' },
                    Overdue: { label: 'Quá Hạn Mượn', color: 'red' },
                    Returned: { label: 'Đã Trả Sách', color: 'default' },
                };
                const config = statusMap[r.status] || { label: r.status, color: 'default' };
                return (
                    <Tag color={config.color} className="font-extrabold text-[10px] uppercase rounded-lg">
                        {config.label}
                    </Tag>
                );
            },
        },
        {
            title: 'Thao Tác',
            key: 'action',
            render: (_, r) => (
                <Button
                    size="small"
                    onClick={() => navigate('/my-rentals')}
                    className="font-bold text-xs rounded-lg bg-stone-100 text-stone-800"
                >
                    Chi tiết
                </Button>
            ),
        },
    ];

    const purchaseColumns = [
        {
            title: 'Mã Tài Liệu',
            dataIndex: 'docCode',
            key: 'docCode',
            render: (text) => <span className="font-mono font-black text-amber-900 text-xs">{text}</span>,
        },
        {
            title: 'Tên Đề Tài / Tài Liệu Số',
            dataIndex: 'docTitle',
            key: 'docTitle',
            render: (text, r) => (
                <div>
                    <div className="font-bold text-stone-900 text-xs line-clamp-1">{text || r.digitalDocument?.title}</div>
                    <div className="text-[10px] text-stone-400 font-mono">Bản quyền 100% trang PDF</div>
                </div>
            ),
        },
        {
            title: 'Giá Mua',
            dataIndex: 'amount',
            key: 'amount',
            render: (val) => (
                <span className="font-black text-amber-900 text-xs">
                    {val > 0 ? `${Number(val).toLocaleString()}đ` : 'Miễn Phí'}
                </span>
            ),
        },
        {
            title: 'Ngày Mua',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (val) => <span className="text-xs text-stone-500 font-medium">{dayjs(val).format('DD/MM/YYYY HH:mm')}</span>,
        },
        {
            title: 'Thao Tác',
            key: 'action',
            render: (_, r) => (
                <Button
                    type="primary"
                    size="small"
                    icon={<Eye className="w-3.5 h-3.5" />}
                    onClick={() => navigate(`/digital-docs/${r.digitalDocId || r.id}`)}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg border-none"
                >
                    Đọc Online
                </Button>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-[#faf9f6] text-stone-800 flex flex-col font-sans">
            {/* Header Navigation */}
            <MainHeader />
            <CategoryNavbar />

            {/* Main Content Container */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 space-y-8">
                {/* Back Link */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-stone-600 hover:text-amber-700 font-bold text-xs transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Quay về trang chủ</span>
                    </button>
                    <Tag color="amber" className="font-mono text-xs font-bold rounded-lg uppercase">
                        Hồ Sơ Độc Giả Thư Viện
                    </Tag>
                </div>

                {/* USER PROFILE IDENTITY HERO BANNER */}
                <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-stone-800">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 z-10">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-amber-500 text-stone-950 font-black text-3xl flex items-center justify-center border-4 border-stone-800 shadow-xl overflow-hidden">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                                ) : (
                                    user?.fullName?.charAt(0).toUpperCase() || 'U'
                                )}
                            </div>
                            <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-5 h-5 rounded-full border-2 border-stone-900 shadow-md" />
                        </div>

                        {/* User Metadata */}
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl md:text-3xl font-black text-white">{user?.fullName || 'Độc Giả Thư Viện'}</h1>
                                <Tag color="amber" className="font-extrabold text-[10px] uppercase rounded-full m-0 px-2.5">
                                    {user?.userType === 'student' ? 'Sinh Viên' : user?.userType === 'staff' ? 'Cán Bộ' : 'Khách Vãng Lai'}
                                </Tag>
                            </div>
                            <p className="text-xs text-stone-300 font-medium flex items-center gap-3">
                                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-amber-400" /> {user?.email}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-amber-400" /> {user?.phone || 'Chưa cập nhật SĐT'}</span>
                            </p>
                            <div className="flex items-center gap-2 pt-1 font-mono text-xs text-amber-400 font-bold">
                                <span>Mã Thẻ: {user?.memberCode || 'MB-2026-PENDING'}</span>
                                <span>•</span>
                                <span className="text-stone-400">Tham gia: {dayjs(user?.createdAt).format('MM/YYYY')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Wallet & Reader Card Badges */}
                    <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto z-10">
                        {/* Wallet Balance Box */}
                        <div className="bg-stone-900/90 border border-stone-800 p-3.5 rounded-2xl flex items-center justify-between gap-4 min-w-[240px]">
                            <div>
                                <div className="text-[10px] text-stone-400 font-bold uppercase">Số Dư Ví Cọc</div>
                                <div className="text-lg font-black text-emerald-400">
                                    {(user?.walletBalance || 0).toLocaleString()} VNĐ
                                </div>
                            </div>
                            <Button
                                type="primary"
                                size="small"
                                icon={<Wallet className="w-3.5 h-3.5" />}
                                onClick={() => setDepositModalVisible(true)}
                                className="bg-emerald-600 hover:bg-emerald-700 border-none font-bold text-xs rounded-xl h-8"
                            >
                                Nạp Ví
                            </Button>
                        </div>

                        {/* Reader Card Box */}
                        <div className="bg-stone-900/90 border border-stone-800 p-3.5 rounded-2xl flex items-center justify-between gap-4 min-w-[240px]">
                            <div>
                                <div className="text-[10px] text-stone-400 font-bold uppercase">Thẻ Thư Viện Điện Tử</div>
                                <div className="text-xs font-extrabold text-amber-400 uppercase mt-0.5 flex items-center gap-1.5">
                                    {user?.cardStatus === 'active' ? (
                                        <>
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                            <span>Đã Kích Hoạt</span>
                                        </>
                                    ) : (
                                        <>
                                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                                            <span>Hồ Sơ Chờ Duyệt</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <Button
                                size="small"
                                icon={<CreditCard className="w-3.5 h-3.5" />}
                                onClick={() => setCardModalVisible(true)}
                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl h-8 border-none"
                            >
                                Xem Thẻ
                            </Button>
                        </div>
                    </div>
                </div>

                {/* TABBED CONTENT SECTIONS */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200 shadow-2xs">
                    <Tabs
                        defaultActiveKey="profile"
                        size="large"
                        items={[
                            {
                                key: 'profile',
                                label: (
                                    <span className="flex items-center gap-2 font-bold text-sm">
                                        <User className="w-4 h-4 text-amber-600" />
                                        Hồ Sơ Cá Nhân & Đổi Mật Khẩu
                                    </span>
                                ),
                                children: (
                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
                                        {/* Left Column: Update Info Form */}
                                        <div className="lg:col-span-7 space-y-4">
                                            <div className="border-b pb-3">
                                                <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                                                    <User className="w-4 h-4 text-amber-600" />
                                                    Thông Tin Tài Khoản
                                                </h3>
                                                <p className="text-xs text-stone-500 font-medium">
                                                    Cập nhật thông tin cá nhân dùng để đăng ký mượn sách và cấp Thẻ thư viện.
                                                </p>
                                            </div>

                                            <Form form={profileForm} layout="vertical" onFinish={handleUpdateProfile} className="space-y-3">
                                                <Form.Item
                                                    label={<span className="font-bold text-xs text-stone-800">Họ và Tên</span>}
                                                    name="fullName"
                                                    rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                                                >
                                                    <Input prefix={<User className="w-4 h-4 text-stone-400" />} className="rounded-xl text-xs h-10" />
                                                </Form.Item>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <Form.Item
                                                        label={<span className="font-bold text-xs text-stone-800">Số Điện Thoại</span>}
                                                        name="phone"
                                                        rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}
                                                    >
                                                        <Input prefix={<Phone className="w-4 h-4 text-stone-400" />} className="rounded-xl text-xs h-10" />
                                                    </Form.Item>

                                                    <Form.Item
                                                        label={<span className="font-bold text-xs text-stone-800">Địa Chỉ Email (Cố Định)</span>}
                                                        name="email"
                                                    >
                                                        <Input prefix={<Mail className="w-4 h-4 text-stone-400" />} disabled className="rounded-xl text-xs h-10 bg-stone-100" />
                                                    </Form.Item>
                                                </div>

                                                <Form.Item
                                                    label={<span className="font-bold text-xs text-stone-800">Địa Chỉ Nhận Sách / Hộ Khẩu</span>}
                                                    name="address"
                                                >
                                                    <Input.TextArea rows={2} placeholder="Nhập địa chỉ nhà riêng để giao sách tận nơi..." className="rounded-xl text-xs" />
                                                </Form.Item>

                                                <Form.Item
                                                    label={<span className="font-bold text-xs text-stone-800">Đường Dẫn Ảnh Đại Diện (Avatar URL)</span>}
                                                    name="avatar"
                                                >
                                                    <Input placeholder="https://..." className="rounded-xl text-xs h-10" />
                                                </Form.Item>

                                                <div className="pt-2">
                                                    <Button
                                                        type="primary"
                                                        loading={updatingProfile}
                                                        htmlType="submit"
                                                        className="bg-amber-600 hover:bg-amber-700 border-none font-bold text-xs rounded-xl h-10 px-6"
                                                    >
                                                        Lưu Thay Đổi Hồ Sơ
                                                    </Button>
                                                </div>
                                            </Form>
                                        </div>

                                        {/* Right Column: Change Password */}
                                        <div className="lg:col-span-5 bg-stone-50 p-6 rounded-3xl border border-stone-200 space-y-4">
                                            <div className="border-b pb-3">
                                                <h3 className="text-base font-black text-stone-900 flex items-center gap-2">
                                                    <KeyRound className="w-4 h-4 text-amber-600" />
                                                    Đổi Mật Khẩu
                                                </h3>
                                                <p className="text-xs text-stone-500 font-medium">Bảo vệ an toàn tài khoản của bạn.</p>
                                            </div>

                                            <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword} className="space-y-3">
                                                <Form.Item
                                                    label={<span className="font-bold text-xs text-stone-800">Mật Khẩu Hiện Tại</span>}
                                                    name="currentPassword"
                                                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                                                >
                                                    <Input.Password prefix={<Lock className="w-4 h-4 text-stone-400" />} className="rounded-xl text-xs h-10" />
                                                </Form.Item>

                                                <Form.Item
                                                    label={<span className="font-bold text-xs text-stone-800">Mật Khẩu Mới</span>}
                                                    name="newPassword"
                                                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }]}
                                                >
                                                    <Input.Password prefix={<Lock className="w-4 h-4 text-stone-400" />} className="rounded-xl text-xs h-10" />
                                                </Form.Item>

                                                <Form.Item
                                                    label={<span className="font-bold text-xs text-stone-800">Xác Nhận Mật Khẩu Mới</span>}
                                                    name="confirmPassword"
                                                    rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới' }]}
                                                >
                                                    <Input.Password prefix={<Lock className="w-4 h-4 text-stone-400" />} className="rounded-xl text-xs h-10" />
                                                </Form.Item>

                                                <div className="pt-2">
                                                    <Button
                                                        type="primary"
                                                        loading={changingPassword}
                                                        htmlType="submit"
                                                        className="bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl h-10 w-full"
                                                    >
                                                        Cập Nhật Mật Khẩu
                                                    </Button>
                                                </div>
                                            </Form>

                                            <div className="pt-4 border-t border-stone-200">
                                                <Button
                                                    danger
                                                    icon={<LogOut className="w-4 h-4" />}
                                                    onClick={() => {
                                                        logout();
                                                        navigate('/auth');
                                                    }}
                                                    className="w-full font-bold text-xs rounded-xl h-10"
                                                >
                                                    Đăng Xuất Tài Khoản
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                key: 'rentals',
                                label: (
                                    <span className="flex items-center gap-2 font-bold text-sm">
                                        <BookOpen className="w-4 h-4 text-amber-600" />
                                        Sổ Mượn Sách In ({rentals.length})
                                    </span>
                                ),
                                children: (
                                    <div className="space-y-4 pt-2">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-base font-black text-stone-900">Danh Sách Phiếu Mượn Sách In</h3>
                                            <Button
                                                type="primary"
                                                icon={<BookOpen className="w-4 h-4" />}
                                                onClick={() => navigate('/')}
                                                className="bg-amber-600 hover:bg-amber-700 font-bold text-xs rounded-xl"
                                            >
                                                + Mượn Thêm Sách
                                            </Button>
                                        </div>
                                        <Table
                                            dataSource={rentals}
                                            columns={rentalColumns}
                                            rowKey="id"
                                            loading={loadingRentals}
                                            pagination={{ pageSize: 5 }}
                                            className="rounded-2xl border overflow-hidden"
                                        />
                                    </div>
                                ),
                            },
                            {
                                key: 'digital-docs',
                                label: (
                                    <span className="flex items-center gap-2 font-bold text-sm">
                                        <FileCheck className="w-4 h-4 text-amber-600" />
                                        Tài Liệu Số Đã Mua ({purchases.length})
                                    </span>
                                ),
                                children: (
                                    <div className="space-y-4 pt-2">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-base font-black text-stone-900">Danh Sách Tài Liệu Số & Đồ Án Đã Sở Hữu</h3>
                                            <Button
                                                type="primary"
                                                icon={<FileCheck className="w-4 h-4" />}
                                                onClick={() => navigate('/digital-docs')}
                                                className="bg-amber-600 hover:bg-amber-700 font-bold text-xs rounded-xl"
                                            >
                                                Tra Cứu Tài Liệu Số
                                            </Button>
                                        </div>
                                        <Table
                                            dataSource={purchases}
                                            columns={purchaseColumns}
                                            rowKey="id"
                                            loading={loadingPurchases}
                                            pagination={{ pageSize: 5 }}
                                            className="rounded-2xl border overflow-hidden"
                                        />
                                    </div>
                                ),
                            },
                        ]}
                    />
                </div>
            </main>

            {/* Reader Card Modal */}
            <ReaderCardModal visible={cardModalVisible} onClose={() => setCardModalVisible(false)} />

            {/* Wallet Deposit Modal */}
            <WalletDepositModal visible={depositModalVisible} onClose={() => setDepositModalVisible(false)} />

            {/* Footer */}
            <Footer />
        </div>
    );
}
