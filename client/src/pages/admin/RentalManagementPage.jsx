import React, { useState, useEffect } from 'react';
import {
    Table,
    Tag,
    Button,
    Input,
    Select,
    Modal,
    Form,
    InputNumber,
    Badge,
    Space,
    Tooltip,
    Alert,
    Divider,
    DatePicker,
} from 'antd';
import showToast from '../../utils/toast';
import {
    FileCheck,
    Clock,
    PackageCheck,
    BookOpen,
    CheckCircle2,
    XCircle,
    Search,
    RefreshCw,
    FileSpreadsheet,
    Eye,
    UserCheck,
    AlertTriangle,
    Calendar,
    CreditCard,
    Barcode,
    Sparkles,
    ChevronRight,
    ShieldCheck,
    Building,
    RotateCcw,
    Plus,
    Store,
} from 'lucide-react';
import dayjs from 'dayjs';

import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopbar from '../../components/admin/AdminTopbar';
import {
    getAdminRentalOrdersApi,
    approveRentalOrderApi,
    rejectRentalOrderApi,
    confirmHandoverApi,
    processReturnApi,
    createCounterOrderApi,
} from '../../api/rentalAdmin.api';
import { getAllCopiesApi } from '../../api/inventoryAdmin.api';
import { getAllUsersApi } from '../../api/userAdmin.api';
import { getAllBooksAdminApi, getAllBooksPublicApi } from '../../api/bookAdmin.api';
import { getAllPoliciesApi } from '../../api/rentalPolicyAdmin.api';

const STATUS_CONFIG = {
    Pending: { text: 'Chờ Duyệt Online', color: 'gold', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    Approved: { text: 'Đã Duyệt (Chờ Lấy)', color: 'processing', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    Rented: { text: 'Đang Mượn', color: 'success', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    Overdue: { text: 'Quá Hạn Mượn', color: 'error', bg: 'bg-red-50 text-red-700 border-red-200' },
    Returned: { text: 'Đã Trả Sách', color: 'default', bg: 'bg-stone-100 text-stone-700 border-stone-200' },
    Rejected: { text: 'Đã Từ Chối', color: 'volcano', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
    Cancelled: { text: 'Bạn Đọc Hủy', color: 'default', bg: 'bg-stone-50 text-stone-500 border-stone-200' },
};

export default function RentalManagementPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchText, setSearchText] = useState('');

    // Modal states
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [counterModalOpen, setCounterModalOpen] = useState(false);

    // Form states
    const [approveForm] = Form.useForm();
    const [rejectForm] = Form.useForm();
    const [returnForm] = Form.useForm();
    const [counterForm] = Form.useForm();
    const [actionLoading, setActionLoading] = useState(false);

    // Counter order data
    const [usersList, setUsersList] = useState([]);
    const [booksList, setBooksList] = useState([]);
    const [counterSelectedBook, setCounterSelectedBook] = useState(null);
    const [counterAvailableCopies, setCounterAvailableCopies] = useState([]);
    const [activePolicy, setActivePolicy] = useState(null);

    const handleOpenCounterModal = async () => {
        setCounterModalOpen(true);
        counterForm.resetFields();
        setCounterSelectedBook(null);
        setCounterAvailableCopies([]);
        try {
            const [uRes, bRes, pRes] = await Promise.all([
                getAllUsersApi(),
                getAllBooksAdminApi(),
                getAllPoliciesApi(),
            ]);
            setUsersList(uRes.metadata || uRes.data || uRes || []);

            const bList =
                bRes.metadata?.books ||
                bRes.metadata ||
                bRes.data?.books ||
                bRes.data ||
                (Array.isArray(bRes) ? bRes : []);
            setBooksList(Array.isArray(bList) ? bList : []);

            const pList = pRes.metadata || pRes.data || pRes || [];
            const pol = Array.isArray(pList) ? pList.find((p) => p.userType === 'student') || pList[0] : null;
            setActivePolicy(pol);

            if (pol) {
                if (pol.allowHomeBorrow) counterForm.setFieldsValue({ borrowType: 'home' });
                else if (pol.allowRoomRead) counterForm.setFieldsValue({ borrowType: 'room' });
            }
        } catch (e) {
            console.error('Failed to load users, books or policy for counter modal', e);
            setBooksList([]);
        }
    };

    const handleCounterUserSelect = (userId) => {
        const selectedUser = usersList.find((u) => u.id === userId);
        if (selectedUser) {
            counterForm.setFieldsValue({
                customerName: selectedUser.fullName,
                phone: selectedUser.phone || '',
            });
        }
    };

    const handleCounterBookSelect = async (bookId) => {
        const foundBook = booksList.find((b) => String(b.id) === String(bookId));
        setCounterSelectedBook(foundBook);
        try {
            const cRes = await getAllCopiesApi({ bookId });
            const copies = cRes.metadata || cRes.data || cRes || [];
            const availables = Array.isArray(copies)
                ? copies
                    .filter((c) => c.status === 'available' || c.status === 'Available')
                    .map((c) => ({ ...c, dkcbCode: c.dkcbCode || c.copyId || `DKCB-${c.id}` }))
                : [];
            setCounterAvailableCopies(availables);
            if (availables.length === 0) {
                showToast.warning('Đầu sách này hiện chưa có bản sao vật lý nào khả dụng trong kho.');
            }
        } catch (e) {
            console.error('Failed to load copies for book:', e);
            setCounterAvailableCopies([]);
            showToast.error('Lỗi khi tải danh sách bản sao của sách!');
        }
    };

    const handleCounterSubmit = async (values) => {
        setActionLoading(true);
        try {
            const selectedUser = usersList.find((u) => u.id === values.userId);
            const payload = {
                userId: values.userId || null,
                customerName: selectedUser ? selectedUser.fullName : values.customerName || 'Bạn đọc tại quầy',
                phone: selectedUser ? selectedUser.phone : values.phone || '0900000000',
                borrowType: values.borrowType || 'home',
                pickupDate: dayjs().format('YYYY-MM-DD'),
                dueDate: values.dueDate
                    ? values.dueDate.format('YYYY-MM-DD')
                    : dayjs().add(14, 'day').format('YYYY-MM-DD'),
                note: values.note || 'Lập phiếu mượn trực tiếp tại quầy thủ thư',
                items: [
                    {
                        bookId: values.bookId,
                        deposit: counterSelectedBook?.deposit || 50000,
                        dkcbCode: values.dkcbCode,
                        copyId: values.dkcbCode,
                    },
                ],
            };

            await createCounterOrderApi(payload);
            showToast.success('Lập phiếu mượn trực tiếp tại quầy thành công!');
            setCounterModalOpen(false);
            fetchOrders();
        } catch (err) {
            showToast.error(err.response?.data?.message || 'Lỗi khi lập phiếu mượn tại quầy');
        } finally {
            setActionLoading(false);
        }
    };

    // Available copies mapping for approval
    const [availableCopiesMap, setAvailableCopiesMap] = useState({});

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await getAdminRentalOrdersApi({ status: statusFilter, search: searchText });
            const list = res.metadata || res.data || res || [];
            setOrders(Array.isArray(list) ? list : []);
        } catch (err) {
            console.error(err);
            showToast.error('Không thể tải danh sách phiếu mượn sách!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const handleSearch = () => {
        fetchOrders();
    };

    // Open Approval Modal & fetch available physical copies for each book in order
    const handleOpenApproveModal = async (order) => {
        setSelectedOrder(order);
        setApproveModalOpen(true);

        const copiesMap = {};
        if (order.items && order.items.length > 0) {
            for (const item of order.items) {
                try {
                    const res = await getAllCopiesApi({ bookId: item.bookId });
                    const copies = res.metadata || res.data || res || [];
                    const availables = Array.isArray(copies)
                        ? copies.filter((c) => !c.status || c.status.toLowerCase() === 'available')
                        : [];
                    copiesMap[item.bookId] = availables;
                } catch (e) {
                    console.warn('Failed to load copies for book', item.bookId);
                    copiesMap[item.bookId] = [];
                }
            }
        }
        setAvailableCopiesMap(copiesMap);

        // Initial values - assign distinct copy for each item if possible
        const initialMapping = {};
        const usedCopyCodes = new Set();
        order.items?.forEach((item) => {
            const availables = copiesMap[item.bookId] || [];
            const unusedCopy = availables.find((c) => {
                const code = c.dkcbCode || c.copyId;
                return code && !usedCopyCodes.has(code);
            });

            if (unusedCopy) {
                const code = unusedCopy.dkcbCode || unusedCopy.copyId;
                usedCopyCodes.add(code);
                initialMapping[`dkcb_${item.id}`] = code;
            } else if (item.dkcbCode) {
                initialMapping[`dkcb_${item.id}`] = item.dkcbCode;
            } else {
                const cleanId = String(item.bookId || '0001').replace(/[^a-zA-Z0-9]/g, '').slice(-6) || '0001';
                const currentYear = new Date().getFullYear();
                initialMapping[`dkcb_${item.id}`] = `DKCB-${currentYear}-${cleanId}-0001`;
            }
        });
        approveForm.setFieldsValue(initialMapping);
    };

    // Submit Approve Order
    const handleApproveSubmit = async (values) => {
        setActionLoading(true);
        try {
            const itemsMapping = selectedOrder.items?.map((item) => ({
                itemId: item.id,
                bookId: item.bookId,
                dkcbCode: values[`dkcb_${item.id}`] || item.dkcbCode || '',
            }));

            await approveRentalOrderApi(selectedOrder.id, { itemsMapping });
            showToast.success(`Đã phê duyệt phiếu mượn ${selectedOrder.orderCode} thành công!`);
            setApproveModalOpen(false);
            setDetailModalOpen(false);
            fetchOrders();
        } catch (err) {
            showToast.error(err.response?.data?.message || 'Lỗi khi duyệt phiếu mượn');
        } finally {
            setActionLoading(false);
        }
    };

    // Submit Reject Order
    const handleRejectSubmit = async (values) => {
        setActionLoading(true);
        try {
            await rejectRentalOrderApi(selectedOrder.id, { rejectionReason: values.rejectionReason });
            showToast.success(`Đã từ chối phiếu mượn ${selectedOrder.orderCode}`);
            setRejectModalOpen(false);
            setDetailModalOpen(false);
            fetchOrders();
        } catch (err) {
            showToast.error(err.response?.data?.message || 'Lỗi từ chối phiếu');
        } finally {
            setActionLoading(false);
        }
    };

    // Submit Handover (Confirm handover books to reader)
    const handleConfirmHandover = async (order) => {
        Modal.confirm({
            title: 'Xác Nhận Giao Sách Cho Bạn Đọc',
            content: `Xác nhận bạn đọc ${order.customerName} đã đến quầy và nhận đủ ${order.items?.length || 1} đầu sách của phiếu ${order.orderCode}?`,
            okText: 'Xác Nhận Đã Giao',
            cancelText: 'Hủy',
            okButtonProps: { className: 'bg-emerald-600 font-bold' },
            onOk: async () => {
                try {
                    await confirmHandoverApi(order.id);
                    showToast.success('Đã chuyển phiếu mượn sang trạng thái "Đang Mượn"!');
                    setDetailModalOpen(false);
                    fetchOrders();
                } catch (err) {
                    showToast.error(err.response?.data?.message || 'Lỗi khi xác nhận giao sách');
                }
            },
        });
    };

    // Open Return Modal
    const handleOpenReturnModal = (order) => {
        setSelectedOrder(order);
        returnForm.setFieldsValue({
            fineAmount: Number(order.fineAmount) || 0,
            note: Number(order.fineAmount) > 0
                ? `Trả sách quá hạn. Phí phạt tự tính: ${Number(order.fineAmount).toLocaleString('vi-VN')} đ.`
                : 'Trả sách bình thường, thể trạng sách tốt.',
        });
        setReturnModalOpen(true);
    };

    // Submit Process Return
    const handleReturnSubmit = async (values) => {
        setActionLoading(true);
        try {
            await processReturnApi(selectedOrder.id, values);
            showToast.success(`Đã tiếp nhận trả sách & hoàn kho thành công cho phiếu ${selectedOrder.orderCode}!`);
            setReturnModalOpen(false);
            setDetailModalOpen(false);
            fetchOrders();
        } catch (err) {
            showToast.error(err.response?.data?.message || 'Lỗi khi tiếp nhận trả sách');
        } finally {
            setActionLoading(false);
        }
    };

    // Export CSV
    const handleExportCSV = () => {
        if (orders.length === 0) {
            showToast.warning('Không có dữ liệu phiếu mượn để xuất!');
            return;
        }
        const headers = [
            'Mã Phiếu',
            'Tên Bạn Đọc',
            'Số Điện Thoại',
            'Hình Thức',
            'Tổng Cọc (đ)',
            'Phí Mượn (đ)',
            'Hạn Trả',
            'Trạng Thái',
        ];
        const rows = orders.map((o) => [
            o.orderCode,
            `"${o.customerName}"`,
            o.phone,
            o.borrowType === 'home' ? 'Mượn về nhà' : 'Đọc tại chỗ',
            o.depositTotal || 0,
            o.rentTotal || 0,
            o.dueDate || '',
            STATUS_CONFIG[o.status]?.text || o.status,
        ]);

        const csvContent =
            'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Danh_sach_phieu_muon_${dayjs().format('YYYY-MM-DD')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast.success('Đã tải xuống file CSV danh sách phiếu mượn!');
    };

    // Statistics counters
    const countPending = orders.filter((o) => o.status === 'Pending').length;
    const countApproved = orders.filter((o) => o.status === 'Approved').length;
    const countRented = orders.filter((o) => o.status === 'Rented').length;
    const countOverdue = orders.filter(
        (o) =>
            o.status === 'Overdue' ||
            (o.status === 'Rented' && o.dueDate && o.dueDate < new Date().toISOString().slice(0, 10))
    ).length;
    const countReturned = orders.filter((o) => o.status === 'Returned').length;

    const columns = [
        {
            title: 'Mã Phiếu & Thời Gian',
            key: 'orderCode',
            render: (_, r) => (
                <div className="space-y-1">
                    <div className="font-mono font-black text-amber-900 text-xs flex items-center gap-1.5">
                        <Barcode className="w-3.5 h-3.5 text-amber-600" />
                        <span>{r.orderCode}</span>
                    </div>
                    <div className="text-[11px] text-stone-500 font-medium">
                        {dayjs(r.createdAt).format('DD/MM/YYYY HH:mm')}
                    </div>
                </div>
            ),
        },
        {
            title: 'Thông Tin Bạn Đọc',
            key: 'customer',
            render: (_, r) => (
                <div className="space-y-0.5">
                    <div className="font-extrabold text-stone-900 text-xs">{r.customerName}</div>
                    <div className="text-[11px] text-stone-500 font-medium flex items-center gap-2">
                        <span>SĐT: {r.phone}</span>
                        {r.user?.memberCode && (
                            <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded text-[10px] text-stone-700 font-bold">
                                {r.user.memberCode}
                            </span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            title: 'Hình Thức & Số Sách',
            key: 'type',
            render: (_, r) => (
                <div className="space-y-1">
                    <Tag
                        className={`rounded-lg border text-[10px] font-extrabold ${r.borrowType === 'home' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}
                    >
                        {r.borrowType === 'home' ? 'Mượn Về Nhà' : 'Đọc Tại Phòng'}
                    </Tag>
                    <div className="text-[11px] text-stone-600 font-bold">{r.items?.length || 1} cuốn sách</div>
                </div>
            ),
        },
        {
            title: 'Chi Phí Mượn',
            key: 'financials',
            render: (_, r) => (
                <div className="space-y-0.5">
                    <Tag color="emerald" className="rounded-lg text-[10px] font-black">
                        Miễn Phí (0đ)
                    </Tag>
                    <div className="text-[10px] text-stone-500 font-medium">
                        Thẻ Thư Viện
                    </div>
                </div>
            ),
        },
        {
            title: 'Hạn Trả Sách',
            key: 'dueDate',
            render: (_, r) => (
                <div className="space-y-0.5">
                    <div className="text-xs font-bold text-stone-800 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>{r.dueDate || 'Chưa định'}</span>
                    </div>
                    {r.extensionsCount > 0 && (
                        <Tag color="orange" className="text-[9px] font-bold rounded-md px-1">
                            Đã gia hạn {r.extensionsCount} lần
                        </Tag>
                    )}
                </div>
            ),
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const conf = STATUS_CONFIG[status] || { text: status, color: 'default' };
                return (
                    <Tag color={conf.color} className="font-extrabold text-xs rounded-xl px-2.5 py-0.5">
                        {conf.text}
                    </Tag>
                );
            },
        },
        {
            title: 'Thao Tác Duyệt',
            key: 'actions',
            render: (_, r) => (
                <div className="flex items-center gap-1.5">
                    <Button
                        size="small"
                        type="default"
                        icon={<Eye className="w-3.5 h-3.5 text-stone-600" />}
                        onClick={() => {
                            setSelectedOrder(r);
                            setDetailModalOpen(true);
                        }}
                        className="rounded-lg text-xs font-bold"
                    >
                        Chi tiết
                    </Button>

                    {r.status === 'Pending' && (
                        <Button
                            size="small"
                            type="primary"
                            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenApproveModal(r)}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs"
                        >
                            Duyệt
                        </Button>
                    )}

                    {r.status === 'Approved' && (
                        <Button
                            size="small"
                            type="primary"
                            icon={<PackageCheck className="w-3.5 h-3.5" />}
                            onClick={() => handleConfirmHandover(r)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs"
                        >
                            Giao Sách
                        </Button>
                    )}

                    {(r.status === 'Rented' || r.status === 'Overdue') && (
                        <Button
                            size="small"
                            type="primary"
                            icon={<RotateCcw className="w-3.5 h-3.5" />}
                            onClick={() => handleOpenReturnModal(r)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                        >
                            Trả Sách
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="flex min-h-screen bg-stone-50/60 font-sans text-stone-800">
            <AdminSidebar activeMenu="rentals" />

            <div className="flex-1 flex flex-col min-w-0">
                <AdminTopbar />

                <main className="flex-1 p-6 space-y-6 w-full">
                    {/* Header section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                                <ShieldCheck className="w-4 h-4" />
                                <span>Nghiệp Vụ Thủ Thư</span>
                            </div>
                            <h1 className="text-2xl font-black text-stone-900 tracking-tight">
                                Quản Lý Mượn - Trả & Phê Duyệt Phiếu Mượn
                            </h1>
                            <p className="text-xs text-stone-500 font-medium mt-1">
                                Tiếp nhận duyệt phiếu mượn online, gán mã ĐKCB vật lý, giao sách tại quầy và tiếp nhận
                                hoàn kho.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                type="primary"
                                icon={<Plus className="w-4 h-4" />}
                                onClick={handleOpenCounterModal}
                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl h-11 text-xs shadow-md shadow-amber-600/20"
                            >
                                + Lập Phiếu Mượn Tại Quầy
                            </Button>

                            <Button
                                icon={<RefreshCw className="w-4 h-4 text-stone-600" />}
                                onClick={fetchOrders}
                                loading={loading}
                                className="rounded-2xl font-bold text-xs h-11 border-stone-200"
                            >
                                Làm mới
                            </Button>

                            <Button
                                icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
                                onClick={handleExportCSV}
                                className="rounded-2xl font-bold text-xs h-11 border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
                            >
                                Xuất Excel CSV
                            </Button>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div
                            onClick={() => setStatusFilter('Pending')}
                            className={`p-5 rounded-3xl border cursor-pointer transition-all ${statusFilter === 'Pending' ? 'bg-amber-100 border-amber-400 shadow-md font-bold' : 'bg-white border-stone-200 hover:border-amber-300'}`}
                        >
                            <div className="text-[10px] font-black uppercase text-amber-800 tracking-wider">Chờ Duyệt Online</div>
                            <div className="text-2xl font-black text-amber-950 mt-1">
                                {countPending} <span className="text-xs font-bold text-amber-700">phiếu</span>
                            </div>
                        </div>

                        <div
                            onClick={() => setStatusFilter('Approved')}
                            className={`p-5 rounded-3xl border cursor-pointer transition-all ${statusFilter === 'Approved' ? 'bg-blue-100 border-blue-400 shadow-md font-bold' : 'bg-white border-stone-200 hover:border-blue-300'}`}
                        >
                            <div className="text-[10px] font-black uppercase text-blue-800 tracking-wider">Đã Duyệt (Chờ Lấy)</div>
                            <div className="text-2xl font-black text-blue-950 mt-1">
                                {countApproved} <span className="text-xs font-bold text-blue-700">phiếu</span>
                            </div>
                        </div>

                        <div
                            onClick={() => setStatusFilter('Rented')}
                            className={`p-5 rounded-3xl border cursor-pointer transition-all ${statusFilter === 'Rented' ? 'bg-emerald-100 border-emerald-400 shadow-md font-bold' : 'bg-white border-stone-200 hover:border-emerald-300'}`}
                        >
                            <div className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Đang Mượn Giữ Sách</div>
                            <div className="text-2xl font-black text-emerald-950 mt-1">
                                {countRented} <span className="text-xs font-bold text-emerald-700">phiếu</span>
                            </div>
                        </div>

                        <div
                            onClick={() => setStatusFilter('Overdue')}
                            className={`p-5 rounded-3xl border cursor-pointer transition-all ${statusFilter === 'Overdue' ? 'bg-red-100 border-red-400 shadow-md font-bold' : 'bg-white border-stone-200 hover:border-red-300'}`}
                        >
                            <div className="text-[10px] font-black uppercase text-red-800 tracking-wider">Quá Hạn Mượn</div>
                            <div className="text-2xl font-black text-red-950 mt-1">
                                {countOverdue} <span className="text-xs font-bold text-red-700">phiếu</span>
                            </div>
                        </div>

                        <div
                            onClick={() => setStatusFilter('Returned')}
                            className={`p-5 rounded-3xl border cursor-pointer transition-all ${statusFilter === 'Returned' ? 'bg-stone-200 border-stone-400 shadow-md font-bold' : 'bg-white border-stone-200 hover:border-stone-400'}`}
                        >
                            <div className="text-[10px] font-black uppercase text-stone-700 tracking-wider">Đã Trả Hoàn Tất</div>
                            <div className="text-2xl font-black text-stone-900 mt-1">
                                {countReturned} <span className="text-xs font-bold text-stone-600">phiếu</span>
                            </div>
                        </div>
                    </div>

                    {/* Filter Bar & Table */}
                    <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <Input
                                    prefix={<Search className="w-4 h-4 text-stone-400" />}
                                    placeholder="Tìm theo Mã phiếu, Tên, SĐT bạn đọc..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    onPressEnter={handleSearch}
                                    className="rounded-2xl text-xs font-medium h-10 w-full sm:w-80"
                                />
                                <Button
                                    onClick={handleSearch}
                                    className="rounded-2xl font-bold text-xs h-10 bg-stone-900 text-white"
                                >
                                    Tìm kiếm
                                </Button>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <span className="text-xs font-bold text-stone-500 whitespace-nowrap">Trạng Thái:</span>
                                <Select
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                    style={{ width: 180 }}
                                    className="custom-admin-select font-bold text-xs"
                                >
                                    <Select.Option value="all">Tất cả trạng thái</Select.Option>
                                    <Select.Option value="Pending">Chờ Duyệt Online</Select.Option>
                                    <Select.Option value="Approved">Đã Duyệt (Chờ Lấy)</Select.Option>
                                    <Select.Option value="Rented">Đang Mượn Sách</Select.Option>
                                    <Select.Option value="Overdue">Quá Hạn Mượn</Select.Option>
                                    <Select.Option value="Returned">Đã Trả Sách</Select.Option>
                                    <Select.Option value="Rejected">Đã Từ Chối</Select.Option>
                                    <Select.Option value="Cancelled">Bạn Đọc Hủy</Select.Option>
                                </Select>
                            </div>
                        </div>

                        <Table
                            columns={columns}
                            dataSource={orders}
                            rowKey="id"
                            loading={loading}
                            pagination={{ pageSize: 8, showTotal: (total) => `Tổng số ${total} phiếu mượn` }}
                            className="custom-admin-table text-xs"
                        />
                    </div>
                </main>
            </div>

            {/* MODAL 1: VIEW DETAILS */}
            <Modal
                open={detailModalOpen}
                onCancel={() => setDetailModalOpen(false)}
                footer={null}
                width={720}
                title={
                    <div className="flex items-center gap-2">
                        <Barcode className="w-5 h-5 text-amber-600" />
                        <span className="font-black text-stone-900 text-base">
                            Chi Tiết Phiếu Mượn {selectedOrder?.orderCode}
                        </span>
                    </div>
                }
            >
                {selectedOrder && (
                    <div className="space-y-6 pt-2">
                        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                            <div>
                                <div className="text-[10px] text-stone-400 font-bold uppercase">Bạn Đọc</div>
                                <div className="font-extrabold text-stone-900 mt-0.5">{selectedOrder.customerName}</div>
                                <div className="text-[11px] text-stone-500 font-medium">SĐT: {selectedOrder.phone}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-stone-400 font-bold uppercase">Hình Thức</div>
                                <div className="font-bold text-stone-800 mt-0.5">
                                    {selectedOrder.borrowType === 'home' ? 'Mượn Về Nhà' : 'Đọc Tại Phòng'}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] text-stone-400 font-bold uppercase">Thời Hạn Mượn</div>
                                <div className="font-bold text-amber-900 mt-0.5">
                                    {selectedOrder.pickupDate} &rarr; {selectedOrder.dueDate}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] text-stone-400 font-bold uppercase">Trạng Thái</div>
                                <div className="mt-0.5">
                                    <Tag
                                        color={STATUS_CONFIG[selectedOrder.status]?.color}
                                        className="font-bold text-[11px]"
                                    >
                                        {STATUS_CONFIG[selectedOrder.status]?.text}
                                    </Tag>
                                </div>
                            </div>
                        </div>

                        {/* Items list */}
                        <div className="space-y-3">
                            <h4 className="font-black text-stone-900 text-xs uppercase tracking-wide">
                                Danh Sách Đầu Sách Đặt Mượn ({selectedOrder.items?.length || 0} cuốn)
                            </h4>
                            <div className="space-y-2">
                                {selectedOrder.items?.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white p-3 rounded-2xl border border-stone-200 flex items-center justify-between gap-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-14 bg-stone-100 rounded-lg overflow-hidden shrink-0 border border-stone-200">
                                                {item.bookCover ? (
                                                    <img
                                                        src={item.bookCover}
                                                        alt={item.bookTitle}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <BookOpen className="w-5 h-5 text-stone-400 m-auto mt-4" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-extrabold text-xs text-stone-900">
                                                    {item.bookTitle}
                                                </div>
                                                <div className="text-[11px] text-stone-500 mt-0.5 font-medium">
                                                    Mã ĐKCB Vật Lý:{' '}
                                                    <span className="font-mono font-bold text-amber-900">
                                                        {item.dkcbCode || 'Chưa gán'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="text-xs font-black text-amber-900">
                                                {(item.rentFee || 0).toLocaleString()}đ
                                            </div>
                                            <div className="text-[10px] text-stone-400">
                                                Cọc: {(item.depositFee || 0).toLocaleString()}đ
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Financial Summary */}
                        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 flex items-center justify-between">
                            <div>
                                <div className="text-xs font-bold text-amber-950">
                                    Tổng Tiền Đặt Cọc (Hoàn 100% khi trả):
                                </div>
                                <div className="text-xs font-bold text-amber-950 mt-1">Phí Mượn Tạm Tính:</div>
                                <div className="text-sm font-black text-stone-900 mt-2">TỔNG THU BAN ĐẦU:</div>
                            </div>
                            <div className="text-right font-bold text-xs space-y-1">
                                <div>{(selectedOrder.depositTotal || 0).toLocaleString()} đ</div>
                                <div>{(selectedOrder.rentTotal || 0).toLocaleString()} đ</div>
                                <div className="text-base font-black text-amber-950 mt-1">
                                    {(selectedOrder.grandTotal || 0).toLocaleString()} đ
                                </div>
                            </div>
                        </div>

                        {/* Rejection reason if any */}
                        {selectedOrder.rejectionReason && (
                            <Alert
                                message="Lý do từ chối phiếu mượn"
                                description={selectedOrder.rejectionReason}
                                type="error"
                                showIcon
                                className="rounded-2xl"
                            />
                        )}

                        {/* Footer Action buttons */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            {selectedOrder.status === 'Pending' && (
                                <>
                                    <Button
                                        danger
                                        icon={<XCircle className="w-4 h-4" />}
                                        onClick={() => {
                                            setRejectModalOpen(true);
                                        }}
                                        className="rounded-xl font-bold text-xs"
                                    >
                                        Từ Chối Phiếu
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon={<CheckCircle2 className="w-4 h-4" />}
                                        onClick={() => handleOpenApproveModal(selectedOrder)}
                                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs"
                                    >
                                        Duyệt Phiếu & Gán Mã ĐKCB
                                    </Button>
                                </>
                            )}

                            {selectedOrder.status === 'Approved' && (
                                <Button
                                    type="primary"
                                    icon={<PackageCheck className="w-4 h-4" />}
                                    onClick={() => handleConfirmHandover(selectedOrder)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
                                >
                                    Xác Nhận Đã Giao Sách Cho Bạn Đọc
                                </Button>
                            )}

                            {(selectedOrder.status === 'Rented' || selectedOrder.status === 'Overdue') && (
                                <Button
                                    type="primary"
                                    icon={<RotateCcw className="w-4 h-4" />}
                                    onClick={() => handleOpenReturnModal(selectedOrder)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                                >
                                    Tiếp Nhận Trả Sách & Hoàn Kho
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* MODAL 2: APPROVE & ASSIGN PHYSICAL DKCB CODES */}
            <Modal
                open={approveModalOpen}
                onCancel={() => setApproveModalOpen(false)}
                footer={null}
                title={
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span className="font-black text-stone-900 text-base">
                            Phê Duyệt Phiếu & Gán Bản Sách Vật Lý
                        </span>
                    </div>
                }
            >
                {selectedOrder && (
                    <Form
                        form={approveForm}
                        onFinish={handleApproveSubmit}
                        layout="vertical"
                        className="space-y-5 pt-2"
                    >
                        <Alert
                            message="Gán Mã Đăng Ký Cá Biệt (ĐKCB) Vật Lý"
                            description="Thủ thư chọn cuốn sách vật lý đang sẵn sàng trong kho để gán cho từng bản sách mượn trước khi phê duyệt."
                            type="info"
                            showIcon
                            className="rounded-2xl text-xs"
                        />

                        <div className="space-y-4">
                            {selectedOrder.items?.map((item) => {
                                const availables = availableCopiesMap[item.bookId] || [];
                                return (
                                    <div
                                        key={item.id}
                                        className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2.5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="font-extrabold text-xs text-stone-900 flex items-center gap-1.5">
                                                <BookOpen className="w-3.5 h-3.5 text-amber-800" />
                                                <span>{item.bookTitle}</span>
                                            </div>
                                            <div>
                                                {availables.length > 0 ? (
                                                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                        Trong kho: {availables.length} cuốn
                                                    </span>
                                                ) : (
                                                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                                        Kho chưa có bản sao sẵn
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <Form.Item
                                            label={
                                                <span className="font-bold text-xs text-stone-700">
                                                    Chọn Mã ĐKCB Vật Lý Trong Kho
                                                </span>
                                            }
                                            name={`dkcb_${item.id}`}
                                            rules={[{ required: true, message: 'Vui lòng chọn hoặc nhập mã ĐKCB!' }]}
                                            className="mb-0"
                                        >
                                            <Select
                                                placeholder="-- Chọn mã ĐKCB sẵn sàng --"
                                                className="custom-admin-select font-mono font-bold text-xs w-full"
                                                showSearch
                                                optionFilterProp="children"
                                            >
                                                {availables.map((copy) => (
                                                    <Select.Option key={copy.id || copy.dkcbCode} value={copy.dkcbCode || copy.copyId}>
                                                        🏷️ {copy.dkcbCode || copy.copyId} - {copy.location || copy.warehouse?.name || 'Kho'} ({copy.conditionText || 'Tốt'})
                                                    </Select.Option>
                                                ))}
                                                {availables.length === 0 && (
                                                    <Select.Option value={`DKCB-${new Date().getFullYear()}-${String(item.bookId || '0001').replace(/[^a-zA-Z0-9]/g, '').slice(-6) || '0001'}-0001`}>
                                                        ✨ Tự động cấp: DKCB-{new Date().getFullYear()}-{String(item.bookId || '0001').replace(/[^a-zA-Z0-9]/g, '').slice(-6) || '0001'}-0001
                                                    </Select.Option>
                                                )}
                                            </Select>
                                        </Form.Item>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3">
                            <Button onClick={() => setApproveModalOpen(false)} className="rounded-xl font-bold text-xs">
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={actionLoading}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                            >
                                Xác Nhận Phê Duyệt Phiếu
                            </Button>
                        </div>
                    </Form>
                )}
            </Modal>

            {/* MODAL 3: REJECT ORDER */}
            <Modal
                open={rejectModalOpen}
                onCancel={() => setRejectModalOpen(false)}
                footer={null}
                title={<span className="font-black text-rose-700 text-base">Từ Chối Phiếu Mượn Sách</span>}
            >
                <Form form={rejectForm} onFinish={handleRejectSubmit} layout="vertical" className="space-y-4 pt-2">
                    <Form.Item
                        label={<span className="font-bold text-xs text-stone-700">Lý Do Từ Chối Phiếu</span>}
                        name="rejectionReason"
                        rules={[{ required: true, message: 'Nhập lý do từ chối!' }]}
                        initialValue="Số lượng bản sách trong kho tạm thời chưa đáp ứng đủ, xin lỗi quý khách."
                    >
                        <Input.TextArea rows={3} className="rounded-xl text-xs" />
                    </Form.Item>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button onClick={() => setRejectModalOpen(false)} className="rounded-xl font-bold text-xs">
                            Hủy
                        </Button>
                        <Button
                            danger
                            type="primary"
                            htmlType="submit"
                            loading={actionLoading}
                            className="rounded-xl font-bold text-xs"
                        >
                            Xác Nhận Từ Chối Phiếu
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* MODAL 4: PROCESS RETURN & RESTORE COPIES */}
            <Modal
                open={returnModalOpen}
                onCancel={() => setReturnModalOpen(false)}
                footer={null}
                title={
                    <div className="flex items-center gap-2">
                        <RotateCcw className="w-5 h-5 text-emerald-600" />
                        <span className="font-black text-stone-900 text-base">Tiếp Nhận Trả Sách & Hoàn Kho</span>
                    </div>
                }
            >
                {selectedOrder && (
                    <Form form={returnForm} onFinish={handleReturnSubmit} layout="vertical" className="space-y-4 pt-2">
                        <Alert
                            message="Xác Nhận Nhận Lại Bản Sách & Cập Nhật Kho"
                            description={`Kiểm tra thể trạng sách khi nhận lại. Bản sách vật lý sẽ được hoàn về trạng thái "Available" trong kho. Tiền đặt cọc ${(selectedOrder.depositTotal || 0).toLocaleString()}đ sẽ được hoàn lại cho bạn đọc.`}
                            type="success"
                            showIcon
                            className="rounded-2xl text-xs"
                        />

                        <Form.Item
                            label={
                                <span className="font-bold text-xs text-stone-700">
                                    Phí Phát Sinh / Quá Hạn / Bồi Thường (đ)
                                </span>
                            }
                            name="fineAmount"
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                step={5000}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => (value ? value.replace(/\$\s?|(,*)/g, '') : '')}
                                addonAfter="đ"
                                className="rounded-xl text-xs font-bold text-red-600"
                            />
                        </Form.Item>

                        <Form.Item
                            label={
                                <span className="font-bold text-xs text-stone-700">
                                    Ghi Chú Thể Trạng Sách / Trả Sách
                                </span>
                            }
                            name="note"
                        >
                            <Input.TextArea rows={2} className="rounded-xl text-xs" />
                        </Form.Item>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Button onClick={() => setReturnModalOpen(false)} className="rounded-xl font-bold text-xs">
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={actionLoading}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                            >
                                Hoàn Tất Tiếp Nhận Trả Sách
                            </Button>
                        </div>
                    </Form>
                )}
            </Modal>

            {/* MODAL 5: CREATE COUNTER BORROW ORDER */}
            <Modal
                open={counterModalOpen}
                onCancel={() => setCounterModalOpen(false)}
                footer={null}
                width={650}
                title={
                    <div className="flex items-center gap-2">
                        <Store className="w-5 h-5 text-amber-600" />
                        <span className="font-black text-stone-900 text-base">Lập Phiếu Mượn Trực Tiếp Tại Quầy</span>
                    </div>
                }
            >
                <Form
                    form={counterForm}
                    onFinish={handleCounterSubmit}
                    layout="vertical"
                    className="mt-4 space-y-4 pt-2"
                >
                    <Alert
                        message="Nghiệp Vụ Lập Phiếu Mượn Trực Tiếp"
                        description="Dành cho Thủ thư lập phiếu mượn nhanh tại quầy. Phiếu sẽ tự động được gán bản sách vật lý và chuyển thẳng sang trạng thái Đang Mượn."
                        type="info"
                        showIcon
                        className="rounded-2xl text-xs"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            label={<span className="font-bold text-xs text-stone-700">Chọn Bạn Đọc Trực Tiếp</span>}
                            name="userId"
                        >
                            <Select
                                showSearch
                                placeholder="Chọn hoặc tìm Bạn đọc"
                                optionFilterProp="children"
                                onSelect={handleCounterUserSelect}
                                className="rounded-xl text-xs"
                                allowClear
                            >
                                {usersList.map((u) => (
                                    <Select.Option key={u.id} value={u.id}>
                                        {u.fullName} ({u.memberCode || u.phone})
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-bold text-xs text-stone-700">Hình Thức Mượn</span>}
                            name="borrowType"
                        >
                            <Select className="rounded-xl text-xs">
                                <Select.Option value="home" disabled={activePolicy?.allowHomeBorrow === false}>
                                    Mượn Về Nhà {activePolicy?.allowHomeBorrow === false ? '(Tắt theo quy định)' : ''}
                                </Select.Option>
                                <Select.Option value="room" disabled={activePolicy?.allowRoomRead === false}>
                                    Đọc Tại Phòng {activePolicy?.allowRoomRead === false ? '(Tắt theo quy định)' : ''}
                                </Select.Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            label={
                                <span className="font-bold text-xs text-stone-700">
                                    Họ Tên (Nếu không chọn tài khoản)
                                </span>
                            }
                            name="customerName"
                        >
                            <Input placeholder="Nguyễn Văn A" className="rounded-xl text-xs" />
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-bold text-xs text-stone-700">Số Điện Thoại</span>}
                            name="phone"
                        >
                            <Input placeholder="0901234567" className="rounded-xl text-xs" />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            label={<span className="font-bold text-xs text-stone-700">Chọn Đầu Sách Mượn</span>}
                            name="bookId"
                            rules={[{ required: true, message: 'Vui lòng chọn đầu sách!' }]}
                        >
                            <Select
                                showSearch
                                placeholder="Tìm tên hoặc mã sách"
                                optionFilterProp="children"
                                onChange={handleCounterBookSelect}
                                className="rounded-xl text-xs"
                            >
                                {booksList.map((b) => (
                                    <Select.Option key={b.id} value={b.id}>
                                        {b.title} (Kho:{' '}
                                        {b.availableCopies !== undefined ? b.availableCopies : b.totalCopies || 5} bản)
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            label={
                                <span className="font-bold text-xs text-stone-700">Chọn Mã Bản Sách (ĐKCB Vật Lý)</span>
                            }
                            name="dkcbCode"
                            rules={[{ required: true, message: 'Vui lòng chọn mã ĐKCB!' }]}
                        >
                            <Select
                                placeholder={
                                    counterAvailableCopies.length > 0
                                        ? 'Chọn mã ĐKCB còn sẵn'
                                        : 'Chưa chọn sách hoặc hết bản khả dụng'
                                }
                                disabled={counterAvailableCopies.length === 0}
                                className="rounded-xl text-xs"
                            >
                                {counterAvailableCopies.map((c) => {
                                    const code = c.dkcbCode || c.copyId || `DKCB-${c.id}`;
                                    return (
                                        <Select.Option key={c.id || code} value={code}>
                                            Mã ĐKCB: {code} (Vị trí: {c.location || 'Kệ chính'})
                                        </Select.Option>
                                    );
                                })}
                            </Select>
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            label={<span className="font-bold text-xs text-stone-700">Ngày Hẹn Trả Sách</span>}
                            name="dueDate"
                            initialValue={dayjs().add(14, 'day')}
                        >
                            <DatePicker className="w-full rounded-xl text-xs" format="YYYY-MM-DD" />
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-bold text-xs text-stone-700">Ghi Chú Lập Phiếu</span>}
                            name="note"
                            initialValue="Mượn trực tiếp tại quầy thủ thư"
                        >
                            <Input className="rounded-xl text-xs" />
                        </Form.Item>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button onClick={() => setCounterModalOpen(false)} className="rounded-xl font-bold text-xs">
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={actionLoading}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-600/20"
                        >
                            Xác Nhận Tạo Phiếu Mượn Tại Quầy
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
