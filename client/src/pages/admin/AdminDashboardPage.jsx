import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Users,
    CreditCard,
    BookOpen,
    FileCheck,
    Repeat,
    AlertTriangle,
    DollarSign,
    ShoppingBag,
    Clock,
    Download,
    RefreshCw,
    TrendingUp,
    CheckCircle2,
    ShieldAlert,
    Layers,
    FileText,
    GraduationCap,
    Sparkles,
    ArrowUpRight,
    Barcode,
    Award,
    PackageX,
} from 'lucide-react';
import { Button, Select, Spin, Tag, message, Tooltip, Progress } from 'antd';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
} from 'recharts';
import * as XLSX from 'xlsx';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopbar from '../../components/admin/AdminTopbar';
import {
    getDashboardOverviewApi,
    getDashboardChartsApi,
    getDashboardExportDataApi,
} from '../../api/dashboard.api';

const { Option } = Select;

const PIE_COLORS = ['#d97706', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#64748b'];

export function AdminDashboardPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [overview, setOverview] = useState(null);
    const [chartsData, setChartsData] = useState(null);
    const [timeRange, setTimeRange] = useState('year');
    const [exporting, setExporting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [overviewRes, chartsRes] = await Promise.all([
                getDashboardOverviewApi(),
                getDashboardChartsApi({ timeRange }),
            ]);

            setOverview(overviewRes.metadata || overviewRes.data || null);
            setChartsData(chartsRes.metadata || chartsRes.data || null);
        } catch (err) {
            console.error('Fetch dashboard error:', err);
            message.error(err.message || 'Lỗi khi tải dữ liệu thống kê!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [timeRange]);

    // Handle Export Excel with multiple sheets
    const handleExportExcel = async () => {
        setExporting(true);
        try {
            const res = await getDashboardExportDataApi();
            const data = res.metadata || res.data || {};

            const wb = XLSX.utils.book_new();

            // Sheet 1: Tổng Quan Chỉ Số
            const overviewSheetData = [
                { 'Chỉ Số Thống Kê': 'Tổng Số Bạn Đọc Đăng Ký', 'Giá Trị': data.stats?.users?.total || 0, 'Đơn Vị': 'Tài khoản' },
                { 'Chỉ Số Thống Kê': 'Thẻ Thư Viện Đang Hoạt Động', 'Giá Trị': data.stats?.users?.activeCards || 0, 'Đơn Vị': 'Thẻ' },
                { 'Chỉ Số Thống Kê': 'Thẻ Thư Viện Đang Chờ Duyệt', 'Giá Trị': data.stats?.users?.pendingCards || 0, 'Đơn Vị': 'Thẻ' },
                { 'Chỉ Số Thống Kê': 'Thẻ Thư Viện Bị Khóa', 'Giá Trị': data.stats?.users?.lockedCards || 0, 'Đơn Vị': 'Thẻ' },
                { 'Chỉ Số Thống Kê': 'Tổng Số Đầu Sách', 'Giá Trị': data.stats?.books?.totalTitles || 0, 'Đơn Vị': 'Đầu sách' },
                { 'Chỉ Số Thống Kê': 'Tổng Số Bản Sao Vật Lý (ĐKCB)', 'Giá Trị': data.stats?.books?.totalCopies || 0, 'Đơn Vị': 'Cuốn' },
                { 'Chỉ Số Thống Kê': 'Bản Sao Sách Đang Mượn', 'Giá Trị': data.stats?.books?.rentingCopies || 0, 'Đơn Vị': 'Cuốn' },
                { 'Chỉ Số Thống Kê': 'Tổng Tài Liệu Số Bản Quyền', 'Giá Trị': data.stats?.digitalDocs?.totalDocs || 0, 'Đơn Vị': 'Tài liệu' },
                { 'Chỉ Số Thống Kê': 'Tổng Đồ Án / Luận Văn Lưu Chiểu', 'Giá Trị': data.stats?.digitalDocs?.totalTheses || 0, 'Đơn Vị': 'Đề tài' },
                { 'Chỉ Số Thống Kê': 'Số Lượng Phiếu Mượn Đang Mượn', 'Giá Trị': data.stats?.rentals?.activeBorrowOrders || 0, 'Đơn Vị': 'Phiếu' },
                { 'Chỉ Số Thống Kê': 'Số Lượng Phiếu Mượn Đã Hoàn Trả', 'Giá Trị': data.stats?.rentals?.completedOrders || 0, 'Đơn Vị': 'Phiếu' },
                { 'Chỉ Số Thống Kê': 'Số Lượng Sách Đang Quá Hạn', 'Giá Trị': data.stats?.rentals?.overdueOrders || 0, 'Đơn Vị': 'Phiếu' },
                { 'Chỉ Số Thống Kê': 'Tổng Doanh Thu Tài Liệu Số', 'Giá Trị': data.stats?.digitalDocs?.totalRevenue || 0, 'Đơn Vị': 'VNĐ' },
                { 'Chỉ Số Thống Kê': 'Tổng Tiền Phạt Quá Hạn Đã Thu', 'Giá Trị': data.stats?.rentals?.totalFines || 0, 'Đơn Vị': 'VNĐ' },
            ];
            const wsOverview = XLSX.utils.json_to_sheet(overviewSheetData);
            XLSX.utils.book_append_sheet(wb, wsOverview, '1. Tổng Quan Chỉ Số');

            // Sheet 2: Top Sách Mượn Nhiều
            if (data.topBooks && data.topBooks.length > 0) {
                const wsTop = XLSX.utils.json_to_sheet(data.topBooks);
                XLSX.utils.book_append_sheet(wb, wsTop, '2. Top Sách Mượn Nhiều');
            }

            // Sheet 3: Sách Tồn Kho Ít Mượn
            if (data.idleBooks && data.idleBooks.length > 0) {
                const wsIdle = XLSX.utils.json_to_sheet(data.idleBooks);
                XLSX.utils.book_append_sheet(wb, wsIdle, '3. Sách Tồn Kệ Ít Mượn');
            }

            // Sheet 4: Danh Sách Phiếu Mượn Gần Đây
            if (data.recentOrders && data.recentOrders.length > 0) {
                const wsOrders = XLSX.utils.json_to_sheet(data.recentOrders);
                XLSX.utils.book_append_sheet(wb, wsOrders, '4. Phiếu Mượn Gần Đây');
            }

            // Sheet 5: Giao Dịch Mua Tài Liệu Số
            if (data.recentPurchases && data.recentPurchases.length > 0) {
                const wsPurchases = XLSX.utils.json_to_sheet(data.recentPurchases);
                XLSX.utils.book_append_sheet(wb, wsPurchases, '5. Doanh Thu Tài Liệu');
            }

            const fileName = `Bao_Cao_Thong_Ke_Thu_Vien_${new Date().toISOString().slice(0, 10)}.xlsx`;
            XLSX.writeFile(wb, fileName);
            message.success(`Đã xuất file báo cáo "${fileName}" thành công!`);
        } catch (err) {
            console.error('Export excel error:', err);
            message.error('Xuất file Excel thất bại!');
        } finally {
            setExporting(false);
        }
    };

    const users = overview?.users || {};
    const books = overview?.books || {};
    const digitalDocs = overview?.digitalDocs || {};
    const rentals = overview?.rentals || {};
    const pending = overview?.pendingApprovals || {};

    return (
        <div className="flex h-screen bg-[#faf9f6] text-stone-800 font-sans overflow-hidden">
            <AdminSidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <AdminTopbar title="Bảng Điều Khiển & Thống Kê Tổng Quan" />

                <main className="p-6 md:p-8 space-y-8 w-full">
                    {/* TOP CONTROLS & ACTIONS */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
                                <TrendingUp className="w-5 h-5 stroke-[2.2]" />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-stone-900 leading-tight">
                                    Trung Tâm Báo Cáo & Số Liệu Quản Trị
                                </h2>
                                <p className="text-xs text-stone-400 font-medium">
                                    Cập nhật số liệu thời gian thực từ cơ sở dữ liệu thư viện
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Select
                                value={timeRange}
                                onChange={setTimeRange}
                                className="w-36 h-10 text-xs rounded-xl"
                            >
                                <Option value="month">Tháng Này</Option>
                                <Option value="quarter">Quý Này</Option>
                                <Option value="year">Cả Năm 2026</Option>
                            </Select>

                            <Button
                                icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
                                onClick={fetchData}
                                className="rounded-xl h-10 text-xs font-bold"
                            >
                                Làm mới
                            </Button>

                            <Button
                                type="primary"
                                icon={<Download className="w-4 h-4" />}
                                loading={exporting}
                                onClick={handleExportExcel}
                                className="bg-emerald-600 hover:bg-emerald-700 border-none font-bold text-xs h-10 px-5 rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                            >
                                Xuất Báo Cáo Excel
                            </Button>
                        </div>
                    </div>

                    {/* PENDING APPROVALS ALERT BAR */}
                    {pending.totalPending > 0 && (
                        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-300 rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <span className="p-2 rounded-xl bg-amber-500 text-stone-950 font-black text-xs shrink-0 animate-bounce">
                                    {pending.totalPending}
                                </span>
                                <div>
                                    <h4 className="font-black text-amber-950 text-xs md:text-sm">
                                        Có {pending.totalPending} hồ sơ đang chờ Thủ thư phê duyệt xử lý
                                    </h4>
                                    <p className="text-[11px] text-amber-800 font-medium">
                                        Bao gồm hồ sơ thẻ bạn đọc mới, phiếu mượn sách đặt online và đồ án sinh viên nộp lưu chiểu.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {pending.pendingCards > 0 && (
                                    <Link
                                        to="/admin/cards"
                                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-xs transition-colors shadow-2xs"
                                    >
                                        Duyệt {pending.pendingCards} thẻ &rarr;
                                    </Link>
                                )}
                                {pending.pendingBorrowOrders > 0 && (
                                    <Link
                                        to="/admin/rentals"
                                        className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs transition-colors shadow-2xs"
                                    >
                                        Xử lý {pending.pendingBorrowOrders} phiếu mượn &rarr;
                                    </Link>
                                )}
                                {pending.pendingTheses > 0 && (
                                    <Link
                                        to="/admin/digital-docs"
                                        className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors shadow-2xs"
                                    >
                                        Thẩm định {pending.pendingTheses} đồ án &rarr;
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* 7.1. 11 STAT CARDS GRID */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {/* 1. Tổng Bạn Đọc */}
                        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">Bạn Đọc</span>
                                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                    <Users className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-stone-900">{users.total || 0}</div>
                                <div className="text-[11px] text-stone-500 font-medium mt-0.5">
                                    <span className="text-emerald-600 font-bold">{users.activeCards || 0}</span> đã có thẻ thư viện
                                </div>
                            </div>
                        </div>

                        {/* 2. Thẻ Thư Viện Active */}
                        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">Thẻ Thư Viện</span>
                                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                                    <CreditCard className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-stone-900">{users.activeCards || 0}</div>
                                <div className="text-[11px] text-stone-500 font-medium mt-0.5">
                                    <span className="text-amber-600 font-bold">{users.pendingCards || 0}</span> chờ duyệt • <span className="text-rose-600 font-bold">{users.lockedCards || 0}</span> khóa
                                </div>
                            </div>
                        </div>

                        {/* 3. Đầu Sách & Bản Sao */}
                        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">Kho Sách In</span>
                                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-stone-900">{books.totalTitles || 0}</div>
                                <div className="text-[11px] text-stone-500 font-medium mt-0.5">
                                    Tổng <span className="font-bold text-stone-900">{books.totalCopies || 0}</span> bản sao ĐKCB
                                </div>
                            </div>
                        </div>

                        {/* 4. Tài Liệu Số & Đồ Án */}
                        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">Tài Liệu Số</span>
                                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                                    <FileCheck className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-stone-900">{digitalDocs.totalDocs || 0}</div>
                                <div className="text-[11px] text-stone-500 font-medium mt-0.5">
                                    Gồm <span className="font-bold text-purple-700">{digitalDocs.totalTheses || 0}</span> đồ án lưu chiểu
                                </div>
                            </div>
                        </div>

                        {/* 5. Sách Đang Mượn */}
                        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">Đang Lưu Thông</span>
                                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                    <Repeat className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-emerald-600">{books.rentingCopies || 0} cuốn</div>
                                <div className="text-[11px] text-stone-500 font-medium mt-0.5">
                                    {rentals.activeBorrowOrders || 0} phiếu đang mượn
                                </div>
                            </div>
                        </div>

                        {/* 6. Sách Đang Quá Hạn */}
                        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">Sách Quá Hạn</span>
                                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                                    <AlertTriangle className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-rose-600">{rentals.overdueOrders || 0}</div>
                                <div className="text-[11px] text-stone-500 font-medium mt-0.5">
                                    Cần gửi email cảnh báo quá hạn
                                </div>
                            </div>
                        </div>

                        {/* 7. Lượt Mượn & Hoàn Trả */}
                        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">Lượt Mượn - Trả</span>
                                <div className="p-2 rounded-xl bg-stone-100 text-stone-700">
                                    <CheckCircle2 className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-stone-900">{rentals.totalOrders || 0}</div>
                                <div className="text-[11px] text-stone-500 font-medium mt-0.5">
                                    <span className="text-emerald-600 font-bold">{rentals.completedOrders || 0}</span> đã hoàn trả thành công
                                </div>
                            </div>
                        </div>

                        {/* 8. Doanh Thu Tài Liệu Số */}
                        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">Doanh Thu Số</span>
                                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                                    <DollarSign className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <div className="text-xl font-black text-amber-700">
                                    {Number(digitalDocs.totalRevenue || 0).toLocaleString('vi-VN')} đ
                                </div>
                                <div className="text-[11px] text-stone-500 font-medium mt-0.5">
                                    Từ {digitalDocs.totalPurchases || 0} đơn mua bản quyền
                                </div>
                            </div>
                        </div>

                        {/* 9. Tiền Phạt Quá Hạn */}
                        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">Tiền Phạt Thu</span>
                                <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                                    <ShieldAlert className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <div className="text-xl font-black text-rose-600">
                                    {Number(rentals.totalFines || 0).toLocaleString('vi-VN')} đ
                                </div>
                                <div className="text-[11px] text-stone-500 font-medium mt-0.5">
                                    Đã thu từ các phiếu trễ hạn
                                </div>
                            </div>
                        </div>

                        {/* 10. Đơn Hàng Mua Tài Liệu */}
                        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">Đơn Mua Số</span>
                                <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700">
                                    <ShoppingBag className="w-4 h-4" />
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-stone-900">{digitalDocs.totalPurchases || 0}</div>
                                <div className="text-[11px] text-stone-500 font-medium mt-0.5">
                                    Mở khóa đọc PDF toàn văn
                                </div>
                            </div>
                        </div>

                        {/* 11. Tổng Hồ Sơ Chờ Duyệt */}
                        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-3 hover:shadow-md transition-shadow col-span-2 sm:col-span-3 md:col-span-2 lg:col-span-2 bg-gradient-to-br from-white to-amber-50/40">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider">Tổng Hồ Sơ Chờ Duyệt</span>
                                <div className="p-2 rounded-xl bg-amber-500 text-stone-950 font-black">
                                    <Clock className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-2xl font-black text-stone-900">{pending.totalPending || 0} hồ sơ</div>
                                    <div className="text-[11px] text-stone-500 font-medium mt-0.5">
                                        Thẻ: {pending.pendingCards || 0} • Mượn: {pending.pendingBorrowOrders || 0} • Đồ án: {pending.pendingTheses || 0}
                                    </div>
                                </div>
                                <Link
                                    to="/admin/cards"
                                    className="text-xs font-bold text-amber-700 hover:text-amber-800"
                                >
                                    Xem chi tiết &rarr;
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* 7.2. BIỂU ĐỒ PHÂN TÍCH (CHARTS) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Biểu đồ 1: Lượt Mượn & Trả 12 Tháng */}
                        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-black text-sm md:text-base text-stone-900">
                                        Thống Kê Lượt Mượn & Lượt Trả Sách (12 Tháng)
                                    </h3>
                                    <p className="text-xs text-stone-400">So sánh số lượt phát sinh phiếu mượn và hoàn trả qua từng tháng</p>
                                </div>
                            </div>

                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartsData?.timeline || []}>
                                        <defs>
                                            <linearGradient id="colorBorrow" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#d97706" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorReturn" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <RechartsTooltip contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', fontSize: 12 }} />
                                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                                        <Area type="monotone" dataKey="borrowCount" name="Lượt Mượn Sách" stroke="#d97706" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBorrow)" />
                                        <Area type="monotone" dataKey="returnCount" name="Lượt Trả Sách" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReturn)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Biểu đồ 2: Cơ Cấu Sách Theo Chuyên Ngành */}
                        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-black text-sm md:text-base text-stone-900">
                                        Cơ Cấu Sách Theo Chuyên Ngành
                                    </h3>
                                    <p className="text-xs text-stone-400">Tỷ lệ phân bổ đầu sách theo từng tủ sách khoa</p>
                                </div>
                            </div>

                            <div className="h-72 w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartsData?.categoryDistribution || []}
                                            dataKey="bookCount"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={95}
                                            paddingAngle={4}
                                        >
                                            {(chartsData?.categoryDistribution || []).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', fontSize: 12 }} />
                                        <Legend wrapperStyle={{ fontSize: 11 }} layout="horizontal" verticalAlign="bottom" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Biểu đồ 3: Tăng Trưởng Doanh Thu Số & Tiền Phạt */}
                        <div className="lg:col-span-12 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-black text-sm md:text-base text-stone-900">
                                        Tăng Trưởng Doanh Thu Bán Tài Liệu Số & Tiền Phạt (12 Tháng)
                                    </h3>
                                    <p className="text-xs text-stone-400">Dòng tiền thu về từ mở khóa bản quyền PDF và tiền phạt quá hạn (Đơn vị: VNĐ)</p>
                                </div>
                            </div>

                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartsData?.timeline || []}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v / 1000}k`} />
                                        <RechartsTooltip
                                            formatter={(val) => `${Number(val).toLocaleString('vi-VN')} VNĐ`}
                                            contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', fontSize: 12 }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                                        <Bar dataKey="docRevenue" name="Doanh Thu Tài Liệu Số" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                                        <Bar dataKey="fineRevenue" name="Tiền Phạt Quá Hạn" fill="#ef4444" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* TOP SÁCH MƯỢN NHIỀU & SÁCH TỒN KHO ÍT MƯỢN */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top 10 Sách Mượn Nhiều Nhất */}
                        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 font-black text-sm md:text-base text-stone-900">
                                    <Award className="w-5 h-5 text-amber-500" />
                                    <span>Top 10 Đầu Sách Được Mượn Nhiều Nhất</span>
                                </div>
                                <span className="text-xs text-stone-400 font-bold">Xếp theo lượt mượn</span>
                            </div>

                            <div className="divide-y divide-stone-100">
                                {(chartsData?.topBorrowedBooks || []).slice(0, 5).map((book) => (
                                    <div key={book.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                                                book.rank === 1
                                                    ? 'bg-amber-400 text-stone-950 shadow-xs'
                                                    : book.rank === 2
                                                    ? 'bg-stone-300 text-stone-800'
                                                    : book.rank === 3
                                                    ? 'bg-amber-700 text-white'
                                                    : 'bg-stone-100 text-stone-600'
                                            }`}>
                                                {book.rank}
                                            </span>
                                            <img
                                                src={book.image}
                                                alt={book.title}
                                                className="w-10 h-14 rounded-lg object-cover border border-stone-200 shrink-0"
                                            />
                                            <div className="min-w-0 space-y-0.5">
                                                <h4 className="font-extrabold text-xs text-stone-900 truncate">
                                                    {book.title}
                                                </h4>
                                                <p className="text-[11px] text-stone-400 truncate">{book.author}</p>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <div className="font-black text-amber-700 text-xs">
                                                {book.rentalCount} lượt
                                            </div>
                                            <div className="text-[10px] text-stone-400 font-medium">
                                                Hệ số: {book.turnoverRate}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sách Tồn Kho Ít Mượn */}
                        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 font-black text-sm md:text-base text-stone-900">
                                    <PackageX className="w-5 h-5 text-rose-500" />
                                    <span>Cảnh Báo: Sách Tồn Kệ Ít / Chưa Được Mượn</span>
                                </div>
                                <span className="text-xs text-stone-400 font-bold">Cần tối ưu vị trí kho</span>
                            </div>

                            <div className="divide-y divide-stone-100">
                                {(chartsData?.leastBorrowedBooks || []).slice(0, 5).map((book) => (
                                    <div key={book.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <img
                                                src={book.image}
                                                alt={book.title}
                                                className="w-10 h-14 rounded-lg object-cover border border-stone-200 shrink-0"
                                            />
                                            <div className="min-w-0 space-y-0.5">
                                                <h4 className="font-extrabold text-xs text-stone-900 truncate">
                                                    {book.title}
                                                </h4>
                                                <p className="text-[11px] text-stone-400 truncate">{book.author}</p>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <div className="font-black text-stone-500 text-xs">
                                                {book.rentalCount || 0} lượt mượn
                                            </div>
                                            <div className="text-[10px] text-rose-600 font-semibold">
                                                Tồn kệ: {book.availableCopies ?? book.totalCopies ?? 0} cuốn
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AdminDashboardPage;
