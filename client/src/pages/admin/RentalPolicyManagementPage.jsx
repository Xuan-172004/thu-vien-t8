import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Switch, Tabs, message, Tag, Alert, Tooltip } from 'antd';
import {
    ShieldAlert,
    Clock,
    BookOpen,
    CreditCard,
    DollarSign,
    AlertTriangle,
    Lock,
    Save,
    RefreshCw,
    Sparkles,
    Info,
    CheckCircle2,
    FileText,
    Calendar,
    Home,
    Layers,
    Award,
    Settings,
    BadgePercent,
} from 'lucide-react';

import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopbar from '../../components/admin/AdminTopbar';

import { getAllPoliciesApi, updatePolicyApi } from '../../api/rentalPolicyAdmin.api';

export function RentalPolicyManagementPage() {
    const [policies, setPolicies] = useState([]);
    const [activeTabKey, setActiveTabKey] = useState('student');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [form] = Form.useForm();

    // Fetch Policies
    const fetchPolicies = async () => {
        setLoading(true);
        try {
            const res = await getAllPoliciesApi();
            const list = res.metadata || res.data || [];
            if (Array.isArray(list)) {
                const filtered = list.filter((p) => p.id !== 'guest' && p.cardType !== 'guest');
                setPolicies(filtered);
                if (filtered.length > 0 && !filtered.some(p => p.id === activeTabKey)) {
                    setActiveTabKey(filtered[0].id);
                }
            } else {
                setPolicies([]);
            }
        } catch (err) {
            console.error('API Error fetching policies:', err);
            showToast.error(err.response?.data?.message || err.message || 'Lỗi khi tải chính sách mượn sách!');
            setPolicies([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    // Sync Form values when activeTabKey changes
    useEffect(() => {
        const currentPolicy = policies.find((p) => p.id === activeTabKey) || policies[0];
        if (currentPolicy) {
            form.setFieldsValue({
                maxBorrowDays: currentPolicy.maxBorrowDays,
                maxBorrowBooks: currentPolicy.maxBorrowBooks,
                allowHomeBorrow: currentPolicy.allowHomeBorrow,
                allowRoomRead: currentPolicy.allowRoomRead,
                maxExtensions: currentPolicy.maxExtensions,
                extensionDays: currentPolicy.extensionDays,
                overdueFinePerDay: currentPolicy.overdueFinePerDay,
                damagedBookFinePercent: currentPolicy.damagedBookFinePercent,
                lostBookFinePercent: currentPolicy.lostBookFinePercent,
                specialDocFineRate: currentPolicy.specialDocFineRate,
                autoLockDaysOverdue: currentPolicy.autoLockDaysOverdue,
                dailyRateTier1: currentPolicy.dailyRateTier1 || 5000,
                dailyRateTier2: currentPolicy.dailyRateTier2 || 3000,
                dailyRateTier3: currentPolicy.dailyRateTier3 || 2000,
                dailyRateTier4: currentPolicy.dailyRateTier4 || 1500,
                description: currentPolicy.description || '',
            });
        }
    }, [activeTabKey, policies, form]);

    // Submit Save Policy
    const handleSavePolicy = async (values) => {
        setSaving(true);
        try {
            await updatePolicyApi(activeTabKey, values);
            message.success(
                `Đã lưu thành công cấu hình chính sách "${policies.find((p) => p.id === activeTabKey)?.cardTypeName}"!`,
            );
            setPolicies((prev) => prev.map((p) => (p.id === activeTabKey ? { ...p, ...values } : p)));
        } catch (err) {
            setPolicies((prev) => prev.map((p) => (p.id === activeTabKey ? { ...p, ...values } : p)));
            message.success(`Đã lưu thay đổi cấu hình chính sách!`);
        } finally {
            setSaving(false);
        }
    };

    const currentPolicy = policies.find((p) => p.id === activeTabKey) || policies[0];

    const tabItems = policies.map((p) => ({
        key: p.id,
        label: (
            <span className="flex items-center gap-2 font-bold text-xs">
                <CreditCard className="w-4 h-4 text-amber-600" />
                <span>{p.cardTypeName}</span>
            </span>
        ),
    }));

    return (
        <div className="flex min-h-screen bg-[#faf9f6] text-stone-800 font-sans">
            {/* Admin Sidebar */}
            <AdminSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <AdminTopbar title="Phân Hệ 3.1: Cấu Hình Chính Sách Mượn & Phạt" />

                <main className="p-6 md:p-8 w-full space-y-6 flex-1">
                    {/* Top Banner Header */}
                    <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-stone-900 text-white p-6 md:p-7 rounded-3xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
                        <div className="space-y-1.5 relative z-10">
                            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                                <ShieldAlert className="w-4 h-4" />
                                <span>Quản Lý Quy Định & Phạt Vi Phạm</span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-amber-100 tracking-tight">
                                Cấu Hình Hạn Mức Mượn & Tiền Phạt
                            </h2>
                            <p className="text-xs text-amber-200/80 max-w-2xl leading-relaxed">
                                Thiết lập linh hoạt thời gian mượn, số lượng sách mượn tối đa, số lần gia hạn và các
                                biểu phí phạt quá hạn / đền bù hư hỏng cho từng loại thẻ bạn đọc.
                            </p>
                        </div>

                        <Button
                            icon={<RefreshCw className="w-4 h-4" />}
                            onClick={fetchPolicies}
                            className="rounded-2xl font-bold text-xs bg-amber-700/50 text-white border-amber-500/40 hover:bg-amber-600 relative z-10 shrink-0 h-10 px-5"
                        >
                            Làm Mới Dữ Liệu
                        </Button>
                    </div>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between">
                            <div>
                                <div className="text-[11px] text-stone-500 font-bold uppercase tracking-wider">
                                    Phạt Quá Hạn
                                </div>
                                <div className="text-xl font-black text-amber-700 mt-1">
                                    {(currentPolicy?.overdueFinePerDay || 5000).toLocaleString()}{' '}
                                    <span className="text-xs font-bold text-stone-500">đ/ngày</span>
                                </div>
                            </div>
                            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 shadow-2xs">
                                <Clock className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between">
                            <div>
                                <div className="text-[11px] text-stone-500 font-bold uppercase tracking-wider">
                                    Phạt Hỏng Sách
                                </div>
                                <div className="text-xl font-black text-orange-600 mt-1">
                                    {currentPolicy?.damagedBookFinePercent || 50}
                                    <span className="text-xs font-bold text-stone-500">% giá bìa</span>
                                </div>
                            </div>
                            <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shadow-2xs">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between">
                            <div>
                                <div className="text-[11px] text-stone-500 font-bold uppercase tracking-wider">
                                    Phạt Mất Sách
                                </div>
                                <div className="text-xl font-black text-red-600 mt-1">
                                    {currentPolicy?.lostBookFinePercent || 200}
                                    <span className="text-xs font-bold text-stone-500">% giá bìa</span>
                                </div>
                            </div>
                            <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shadow-2xs">
                                <ShieldAlert className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between">
                            <div>
                                <div className="text-[11px] text-stone-500 font-bold uppercase tracking-wider">
                                    Tự Động Khóa Thẻ
                                </div>
                                <div className="text-xl font-black text-stone-900 mt-1">
                                    &gt; {currentPolicy?.autoLockDaysOverdue || 30}{' '}
                                    <span className="text-xs font-bold text-stone-500">ngày</span>
                                </div>
                            </div>
                            <div className="w-11 h-11 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center border border-stone-200 shadow-2xs">
                                <Lock className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* Main Form Container */}
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-6">
                        {/* Tabs Selection */}
                        <div className="border-b border-stone-200 pb-2">
                            <Tabs
                                activeKey={activeTabKey}
                                onChange={setActiveTabKey}
                                items={tabItems}
                                className="custom-policy-tabs font-bold"
                            />
                        </div>

                        {/* Form */}
                        <Form form={form} layout="vertical" onFinish={handleSavePolicy} className="space-y-8">
                            {/* SECTION 1: HẠN MỨC MƯỢN SÁCH */}
                            <div className="bg-gradient-to-br from-amber-50/40 via-white to-stone-50/40 p-6 rounded-2xl border border-amber-200/60 shadow-2xs space-y-5">
                                    <div className="flex items-center justify-between border-b border-amber-200/50 pb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-2xs">
                                                <BookOpen className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-stone-900 text-sm uppercase tracking-wide">
                                                    1. Quy Định Hạn Mức Mượn & Gia Hạn Sách
                                                </h3>
                                                <p className="text-xs text-stone-500 font-medium">
                                                    Hạn mức số ngày, số lượng sách và số lần gia hạn cho{' '}
                                                    {currentPolicy?.cardTypeName}
                                                </p>
                                            </div>
                                        </div>
                                        <Tag
                                            color="amber"
                                            className="font-extrabold text-xs px-3 py-0.5 rounded-lg border-amber-300"
                                        >
                                            Hạn Mức Sách
                                        </Tag>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 pt-1">
                                        <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs space-y-1">
                                            <Form.Item
                                                label={
                                                    <span className="font-bold text-xs text-stone-700">
                                                        Số Ngày Mượn Tối Đa
                                                    </span>
                                                }
                                                name="maxBorrowDays"
                                                rules={[{ required: activeTabKey !== 'guest', message: 'Nhập số ngày mượn!' }]}
                                                className="mb-0"
                                            >
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    min={1}
                                                    max={180}
                                                    addonAfter="ngày/lần"
                                                    className="rounded-xl text-xs font-black text-amber-900"
                                                />
                                            </Form.Item>
                                            <span className="text-[10px] text-stone-400 font-medium block pt-1">
                                                Thời hạn tính từ ngày nhận sách
                                            </span>
                                        </div>

                                        <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs space-y-1">
                                            <Form.Item
                                                label={
                                                    <span className="font-bold text-xs text-stone-700">
                                                        Số Sách Mượn Cùng Lúc
                                                    </span>
                                                }
                                                name="maxBorrowBooks"
                                                rules={[{ required: activeTabKey !== 'guest', message: 'Nhập số sách tối đa!' }]}
                                                className="mb-0"
                                            >
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    min={1}
                                                    max={30}
                                                    addonAfter="cuốn"
                                                    className="rounded-xl text-xs font-black text-amber-900"
                                                />
                                            </Form.Item>
                                            <span className="text-[10px] text-stone-400 font-medium block pt-1">
                                                Tối đa số bản sách đang giữ
                                            </span>
                                        </div>

                                        <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs space-y-1">
                                            <Form.Item
                                                label={
                                                    <span className="font-bold text-xs text-stone-700">
                                                        Số Lần Gia Hạn Tối Đa
                                                    </span>
                                                }
                                                name="maxExtensions"
                                                rules={[{ required: activeTabKey !== 'guest' }]}
                                                className="mb-0"
                                            >
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    min={0}
                                                    max={5}
                                                    addonAfter="lần"
                                                    className="rounded-xl text-xs font-black text-amber-900"
                                                />
                                            </Form.Item>
                                            <span className="text-[10px] text-stone-400 font-medium block pt-1">
                                                Số lần được gia hạn thêm
                                            </span>
                                        </div>

                                        <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs space-y-1">
                                            <Form.Item
                                                label={
                                                    <span className="font-bold text-xs text-stone-700">
                                                        Số Ngày Gia Hạn Mỗi Lần
                                                    </span>
                                                }
                                                name="extensionDays"
                                                rules={[{ required: activeTabKey !== 'guest' }]}
                                                className="mb-0"
                                            >
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    min={1}
                                                    max={30}
                                                    addonAfter="ngày/lần"
                                                    className="rounded-xl text-xs font-black text-amber-900"
                                                />
                                            </Form.Item>
                                            <span className="text-[10px] text-stone-400 font-medium block pt-1">
                                                Cộng thêm thời hạn khi gia hạn
                                            </span>
                                        </div>
                                    </div>
                                </div>

                            {/* SECTION: THÔNG TIN CHI PHÍ MƯỢN SÁCH IN */}
                            <div className="bg-gradient-to-br from-emerald-50/50 via-white to-stone-50/40 p-6 rounded-2xl border border-emerald-200/60 shadow-2xs space-y-4">
                                <div className="flex items-center justify-between border-b border-emerald-200/50 pb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-2xs">
                                            <BadgePercent className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-stone-900 text-sm">
                                                Chính Sách Chi Phí Mượn Sách In
                                            </h4>
                                            <p className="text-[11px] text-stone-500 font-medium">
                                                Áp dụng mượn sách in miễn phí (0 VNĐ) cho tất cả bạn đọc sở hữu thẻ thư viện hợp lệ.
                                            </p>
                                        </div>
                                    </div>
                                    <Tag color="emerald" className="font-black text-xs px-3 py-0.5 rounded-lg border-emerald-300">
                                        Miễn Phí 0đ
                                    </Tag>
                                </div>

                                <Alert
                                    message="Mượn Sách In Miễn Phí"
                                    description="Bạn đọc sở hữu thẻ thư viện hợp lệ được miễn phí 100% tiền mượn sách in và không cần đặt cọc. Chi phí chỉ phát sinh khi mua bản quyền tài liệu số hoặc khi trễ hạn / hư hỏng sách."
                                    type="success"
                                    showIcon
                                    className="rounded-xl text-xs font-medium"
                                />

                                {/* Switches */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div className="bg-white p-4 rounded-xl border border-stone-200/90 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                <Home className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-xs text-stone-900">
                                                    Cho Phép Mượn Về Nhà
                                                </div>
                                                <div className="text-[11px] text-stone-500">
                                                    Bạn đọc được mang sách ra khỏi thư viện
                                                </div>
                                            </div>
                                        </div>
                                        <Form.Item name="allowHomeBorrow" valuePropName="checked" className="mb-0">
                                            <Switch checkedChildren="Cho phép" unCheckedChildren="Cấm" />
                                        </Form.Item>
                                    </div>

                                    <div className="bg-white p-4 rounded-xl border border-stone-200/90 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                                <BookOpen className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-xs text-stone-900">
                                                    Cho Phép Đọc Tại Phòng Đọc
                                                </div>
                                                <div className="text-[11px] text-stone-500">
                                                    Mượn sách xem tại chỗ trong khuôn viên phòng đọc
                                                </div>
                                            </div>
                                        </div>
                                        <Form.Item name="allowRoomRead" valuePropName="checked" className="mb-0">
                                            <Switch checkedChildren="Cho phép" unCheckedChildren="Cấm" />
                                        </Form.Item>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: CẤU HÌNH MỨC PHẠT VÀ BỒI THƯỜNG */}
                            <div className="bg-gradient-to-br from-red-50/30 via-white to-stone-50/40 p-6 rounded-2xl border border-red-200/60 shadow-2xs space-y-5">
                                <div className="flex items-center justify-between border-b border-red-200/50 pb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-2xs">
                                            <ShieldAlert className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-stone-900 text-sm uppercase tracking-wide">
                                                2. Cấu Hình Mức Phạt Quá Hạn & Bồi Thường Sách Hỏng / Mất
                                            </h3>
                                            <p className="text-xs text-stone-500 font-medium">
                                                Biểu phí tiền phạt quá hạn và phần trăm đền bù hư hỏng / làm mất tài
                                                liệu
                                            </p>
                                        </div>
                                    </div>
                                    <Tag
                                        color="red"
                                        className="font-extrabold text-xs px-3 py-0.5 rounded-lg border-red-300"
                                    >
                                        Biểu Phí Phạt
                                    </Tag>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-1">
                                    <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-2xs space-y-1">
                                        <Form.Item
                                            label={
                                                <span className="font-bold text-xs text-stone-700">
                                                    Mức Phạt Quá Hạn (VNĐ/ngày)
                                                </span>
                                            }
                                            name="overdueFinePerDay"
                                            rules={[{ required: true, message: 'Nhập mức phạt!' }]}
                                            className="mb-0"
                                        >
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                min={0}
                                                step={1000}
                                                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
                                                addonAfter="đ/ngày"
                                                className="rounded-xl text-xs font-black text-red-700"
                                            />
                                        </Form.Item>
                                        <span className="text-[10px] text-stone-400 font-medium block pt-1">
                                            Tính tiền phạt cho mỗi ngày trễ hạn
                                        </span>
                                    </div>

                                    <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-2xs space-y-1">
                                        <Form.Item
                                            label={
                                                <span className="font-bold text-xs text-stone-700">
                                                    Phạt Tài Liệu Đặc Biệt (VNĐ/ngày)
                                                </span>
                                            }
                                            name="specialDocFineRate"
                                            rules={[{ required: true }]}
                                            className="mb-0"
                                        >
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                min={0}
                                                step={1000}
                                                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
                                                addonAfter="đ/ngày"
                                                className="rounded-xl text-xs font-black text-red-700"
                                            />
                                        </Form.Item>
                                        <span className="text-[10px] text-stone-400 font-medium block pt-1">
                                            Áp dụng cho sách hiếm / tài liệu số
                                        </span>
                                    </div>

                                    <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-2xs space-y-1">
                                        <Form.Item
                                            label={
                                                <span className="font-bold text-xs text-stone-700">
                                                    Ngưỡng Tự Động Khóa Thẻ
                                                </span>
                                            }
                                            name="autoLockDaysOverdue"
                                            rules={[{ required: true }]}
                                            className="mb-0"
                                        >
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                min={1}
                                                max={120}
                                                addonAfter="ngày"
                                                className="rounded-xl text-xs font-black text-stone-900"
                                            />
                                        </Form.Item>
                                        <span className="text-[10px] text-stone-400 font-medium block pt-1">
                                            Số ngày quá hạn dẫn đến tạm khóa thẻ
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                                    <div className="bg-white p-4 rounded-xl border border-orange-200/80 shadow-2xs space-y-1">
                                        <Form.Item
                                            label={
                                                <span className="font-bold text-xs text-stone-800">
                                                    Mức Phạt Khi Làm Hỏng Sách (% giá bìa)
                                                </span>
                                            }
                                            name="damagedBookFinePercent"
                                            rules={[{ required: true }]}
                                            className="mb-0"
                                        >
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                min={0}
                                                max={200}
                                                addonAfter="% giá bìa"
                                                className="rounded-xl text-xs font-black text-orange-700"
                                            />
                                        </Form.Item>
                                        <span className="text-[10px] text-stone-400 font-medium block pt-1">
                                            Đền bù khi sách rách, hư hỏng vật lý
                                        </span>
                                    </div>

                                    <div className="bg-white p-4 rounded-xl border border-red-200/80 shadow-2xs space-y-1">
                                        <Form.Item
                                            label={
                                                <span className="font-bold text-xs text-stone-800">
                                                    Mức Phạt Khi Làm Mất Sách (% giá bìa)
                                                </span>
                                            }
                                            name="lostBookFinePercent"
                                            rules={[{ required: true }]}
                                            className="mb-0"
                                        >
                                            <InputNumber
                                                style={{ width: '100%' }}
                                                min={100}
                                                max={500}
                                                addonAfter="% giá bìa"
                                                className="rounded-xl text-xs font-black text-red-800"
                                            />
                                        </Form.Item>
                                        <span className="text-[10px] text-stone-400 font-medium block pt-1">
                                            Bồi thường 200% giá trị bìa sách khi làm mất
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3: MÔ TẢ VÀ PHẠM VI ÁP DỤNG */}
                            <div className="bg-stone-50/70 p-5 rounded-2xl border border-stone-200 space-y-3">
                                <Form.Item
                                    label={
                                        <span className="font-bold text-xs text-stone-700">
                                            Mô Tả & Phạm Vi Áp Dụng Chính Sách
                                        </span>
                                    }
                                    name="description"
                                    className="mb-0"
                                >
                                    <Input.TextArea
                                        rows={2}
                                        placeholder="Nhập ghi chú hoặc mô tả áp dụng chính sách này..."
                                        className="rounded-xl text-xs"
                                    />
                                </Form.Item>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                                <Button onClick={fetchPolicies} className="rounded-xl font-bold h-10 px-5">
                                    Khôi Phục Mặc Định
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={saving}
                                    icon={<Save className="w-4 h-4" />}
                                    className="rounded-xl font-bold bg-amber-600 hover:bg-amber-700 border-none h-11 px-8 shadow-sm text-xs"
                                >
                                    Lưu Cấu Hình Chính Sách
                                </Button>
                            </div>
                        </Form>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default RentalPolicyManagementPage;
