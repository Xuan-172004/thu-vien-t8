import React, { useState, useEffect, useMemo } from 'react';
import {
    Table,
    Input,
    Select,
    Button,
    Tag,
    Modal,
    Form,
    InputNumber,
    Switch,
    Tabs,
    Tooltip,
    Popconfirm,
    Badge,
    Alert,
} from 'antd';
import {
    FileText,
    Plus,
    Search,
    SlidersHorizontal,
    Edit3,
    Trash2,
    Eye,
    EyeOff,
    Download,
    BookOpen,
    GraduationCap,
    DollarSign,
    RefreshCw,
    Sparkles,
    FileCheck,
    Lock,
    ExternalLink,
    CheckCircle2,
    XCircle,
    Clock,
    UserCheck,
    Send,
} from 'lucide-react';

import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopbar from '../../components/admin/AdminTopbar';
import { showToast } from '../../utils/toast';

import {
    getAllDigitalDocsAdminApi,
    createDigitalDocAdminApi,
    updateDigitalDocAdminApi,
    deleteDigitalDocAdminApi,
    toggleStatusDigitalDocAdminApi,
    uploadFileAdminApi,
} from '../../api/digitalDocAdmin.api';

import {
    getSubmissionsAdminApi,
    approveSubmissionAdminApi,
    rejectSubmissionAdminApi,
} from '../../api/thesisSubmission.api';

const categoryOptions = [
    { value: 'all', label: 'Tất cả chuyên ngành' },
    { value: 'CNTT', label: 'Công nghệ Thông tin & AI' },
    { value: 'KinhTe', label: 'Kinh tế & Quản trị Kinh doanh' },
    { value: 'KhoaHoc', label: 'Khoa học Tự nhiên & Kỹ thuật' },
    { value: 'YDuoc', label: 'Y Khoa & Dược Học' },
    { value: 'NgoaiNgu', label: 'Ngoại ngữ & Sư Phạm' },
    { value: 'TamLy', label: 'Tâm lý & Xã hội' },
];

const docTypeOptions = [
    { value: 'all', label: 'Tất cả loại tài liệu' },
    { value: 'thesis', label: 'Đồ án / Luận văn tốt nghiệp' },
    { value: 'ebook', label: 'Sách điện tử (E-book)' },
    { value: 'journal', label: 'Tạp chí khoa học' },
    { value: 'dissertation', label: 'Luận án Tiến sĩ' },
];

export function DigitalDocManagementPage() {
    const [mainMode, setMainMode] = useState('docs'); // 'docs' | 'submissions'

    // 1. Digital Documents State
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedDocType, setSelectedDocType] = useState('all');
    const [statusTab, setStatusTab] = useState('all');

    // Modal & Upload states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [pdfFileValue, setPdfFileValue] = useState('');
    const [coverImageValue, setCoverImageValue] = useState('');
    const [uploadedPdfName, setUploadedPdfName] = useState('');
    const [uploadedCoverName, setUploadedCoverName] = useState('');
    const [uploadingPdf, setUploadingPdf] = useState(false);
    const [uploadingCover, setUploadingCover] = useState(false);
    const [form] = Form.useForm();

    // 2. Thesis Submissions Review State
    const [submissions, setSubmissions] = useState([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [submissionFilterStatus, setSubmissionFilterStatus] = useState('all');
    const [submissionSearch, setSubmissionSearch] = useState('');
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [approveModalVisible, setApproveModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [approveForm] = Form.useForm();
    const [rejectForm] = Form.useForm();

    // Fetch Digital Documents
    const fetchDocs = async () => {
        setLoading(true);
        try {
            const res = await getAllDigitalDocsAdminApi();
            const docsList = res.metadata?.docs || res.data?.docs || (Array.isArray(res.metadata) ? res.metadata : (Array.isArray(res.data) ? res.data : []));
            setDocs(Array.isArray(docsList) ? docsList : []);
        } catch (err) {
            console.error('Lỗi khi tải danh sách tài liệu số:', err);
            showToast.error('Không thể tải danh sách tài liệu số!');
        } finally {
            setLoading(false);
        }
    };

    // Fetch Thesis Submissions
    const fetchSubmissions = async () => {
        setLoadingSubmissions(true);
        try {
            const res = await getSubmissionsAdminApi({ limit: 100 });
            const list = res.metadata?.submissions || res.data?.submissions || res.metadata || [];
            setSubmissions(Array.isArray(list) ? list : []);
        } catch (err) {
            console.warn('Lỗi tải hồ sơ nộp đồ án:', err);
        } finally {
            setLoadingSubmissions(false);
        }
    };

    useEffect(() => {
        fetchDocs();
        fetchSubmissions();
    }, []);

    // File Upload Handlers (Uploads directly to Server /uploads)
    const handlePdfFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
            showToast.error('Vui lòng chọn file định dạng PDF!');
            return;
        }
        setUploadingPdf(true);
        try {
            const res = await uploadFileAdminApi(file);
            const serverUrl = res.metadata?.url || res.url;
            const sizeMB = res.metadata?.size || `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

            setPdfFileValue(serverUrl);
            setUploadedPdfName(file.name);
            form.setFieldsValue({
                pdfFile: serverUrl,
                fileSize: sizeMB,
            });
            showToast.success(`Đã upload file PDF "${file.name}" (${sizeMB}) lên máy chủ!`);
        } catch (err) {
            showToast.error('Không thể upload file PDF lên máy chủ!');
        } finally {
            setUploadingPdf(false);
        }
    };

    const handleCoverImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingCover(true);
        try {
            const res = await uploadFileAdminApi(file);
            const serverUrl = res.metadata?.url || res.url;

            setCoverImageValue(serverUrl);
            setUploadedCoverName(file.name);
            form.setFieldsValue({
                coverImage: serverUrl,
            });
            showToast.success(`Đã upload ảnh bìa "${file.name}" lên máy chủ!`);
        } catch (err) {
            showToast.error('Không thể upload ảnh bìa!');
        } finally {
            setUploadingCover(false);
        }
    };

    // Open Modal Add/Edit Doc
    const handleOpenModal = (doc = null) => {
        setEditingDoc(doc);
        if (doc) {
            form.setFieldsValue({
                docCode: doc.docCode,
                title: doc.title,
                author: doc.author,
                advisor: doc.advisor,
                category: doc.category,
                documentType: doc.documentType,
                publishYear: doc.publishYear,
                pages: doc.pages,
                fileSize: doc.fileSize,
                previewPages: doc.previewPages,
                price: doc.price,
                description: doc.description,
                pdfFile: doc.pdfFile,
                coverImage: doc.coverImage,
                status: doc.status === 'active',
            });
            setPdfFileValue(doc.pdfFile);
            setCoverImageValue(doc.coverImage);
            setUploadedPdfName('');
            setUploadedCoverName('');
        } else {
            const randomCode = `DOC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
            form.resetFields();
            form.setFieldsValue({
                docCode: randomCode,
                publishYear: new Date().getFullYear(),
                pages: 50,
                fileSize: '5.0 MB',
                previewPages: 5,
                price: 0,
                category: 'CNTT',
                documentType: 'thesis',
                status: true,
                pdfFile: '',
                coverImage: '',
            });
            setPdfFileValue('');
            setCoverImageValue('');
            setUploadedPdfName('');
            setUploadedCoverName('');
        }
        setIsModalOpen(true);
    };

    // Save Doc
    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            const payload = {
                ...values,
                pdfFile: pdfFileValue || values.pdfFile,
                coverImage: coverImageValue || values.coverImage,
                status: values.status ? 'active' : 'hidden',
                isForSale: Number(values.price) > 0,
            };

            if (editingDoc) {
                await updateDigitalDocAdminApi(editingDoc.id, payload);
                showToast.success('Cập nhật tài liệu số thành công!');
            } else {
                await createDigitalDocAdminApi(payload);
                showToast.success('Tạo mới tài liệu số thành công!');
            }
            setIsModalOpen(false);
            fetchDocs();
        } catch (err) {
            console.error('Lỗi khi lưu tài liệu số:', err);
            showToast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu tài liệu!');
        } finally {
            setSubmitting(false);
        }
    };

    // Toggle Status
    const handleToggleStatus = async (id) => {
        try {
            await toggleStatusDigitalDocAdminApi(id);
            showToast.success('Thay đổi trạng thái tài liệu thành công!');
            fetchDocs();
        } catch (err) {
            showToast.error('Không thể thay đổi trạng thái tài liệu!');
        }
    };

    // Delete Doc
    const handleDelete = async (id) => {
        try {
            await deleteDigitalDocAdminApi(id);
            showToast.success('Đã xóa tài liệu số!');
            fetchDocs();
        } catch (err) {
            showToast.error('Không thể xóa tài liệu này!');
        }
    };

    // Open Approve Submission Modal
    const handleOpenApprove = (submission) => {
        setSelectedSubmission(submission);
        approveForm.setFieldsValue({
            price: 0,
            previewPages: 5,
            category: submission.faculty || 'CNTT',
            customDocCode: `THESIS-${submission.defenseYear || 2026}-${Math.floor(100 + Math.random() * 900)}`,
        });
        setApproveModalVisible(true);
    };

    // Execute Approve
    const handleFinishApprove = async (values) => {
        if (!selectedSubmission) return;
        setSubmitting(true);
        try {
            const res = await approveSubmissionAdminApi(selectedSubmission.id, values);
            showToast.success(res.message || 'Phê duyệt và xuất bản đồ án thành công!');
            setApproveModalVisible(false);
            setSelectedSubmission(null);
            fetchSubmissions();
            fetchDocs();
        } catch (err) {
            showToast.error(err.response?.data?.message || 'Lỗi khi phê duyệt hồ sơ!');
        } finally {
            setSubmitting(false);
        }
    };

    // Open Reject Submission Modal
    const handleOpenReject = (submission) => {
        setSelectedSubmission(submission);
        rejectForm.resetFields();
        setRejectModalVisible(true);
    };

    // Execute Reject
    const handleFinishReject = async (values) => {
        if (!selectedSubmission) return;
        setSubmitting(true);
        try {
            const res = await rejectSubmissionAdminApi(selectedSubmission.id, values);
            showToast.success(res.message || 'Đã gửi yêu cầu chỉnh sửa đến sinh viên!');
            setRejectModalVisible(false);
            setSelectedSubmission(null);
            fetchSubmissions();
        } catch (err) {
            showToast.error(err.response?.data?.message || 'Lỗi khi gửi phản hồi!');
        } finally {
            setSubmitting(false);
        }
    };

    // Filter Digital Documents
    const filteredDocs = useMemo(() => {
        return docs.filter((doc) => {
            const matchSearch =
                !searchQuery ||
                doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.docCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.author?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.advisor?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchCat = selectedCategory === 'all' || doc.category === selectedCategory;
            const matchType = selectedDocType === 'all' || doc.documentType === selectedDocType;
            const matchStatus = statusTab === 'all' || doc.status === statusTab;

            return matchSearch && matchCat && matchType && matchStatus;
        });
    }, [docs, searchQuery, selectedCategory, selectedDocType, statusTab]);

    // Filter Thesis Submissions
    const filteredSubmissions = useMemo(() => {
        return submissions.filter((sub) => {
            const matchSearch =
                !submissionSearch ||
                sub.title?.toLowerCase().includes(submissionSearch.toLowerCase()) ||
                sub.studentName?.toLowerCase().includes(submissionSearch.toLowerCase()) ||
                sub.studentId?.toLowerCase().includes(submissionSearch.toLowerCase()) ||
                sub.advisor?.toLowerCase().includes(submissionSearch.toLowerCase());

            const matchStatus = submissionFilterStatus === 'all' || sub.status === submissionFilterStatus;
            return matchSearch && matchStatus;
        });
    }, [submissions, submissionSearch, submissionFilterStatus]);

    // Metrics
    const totalDocsCount = docs.length;
    const thesisCount = docs.filter((d) => d.documentType === 'thesis' || d.documentType === 'dissertation').length;
    const ebookCount = docs.filter((d) => d.documentType === 'ebook').length;
    const pendingSubmissionsCount = submissions.filter((s) => s.status === 'pending').length;

    // Table Columns for Digital Documents
    const columns = [
        {
            title: 'Mã & Ảnh Bìa',
            key: 'cover',
            width: 140,
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <img
                        src={record.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=150&q=80'}
                        alt={record.title}
                        className="w-12 h-16 object-cover rounded-lg border border-stone-200 shadow-2xs shrink-0"
                    />
                    <div>
                        <span className="font-mono text-xs font-bold text-amber-900 block">{record.docCode}</span>
                        <Tag color="stone" className="text-[10px] px-1.5 py-0 mt-1 rounded-md">
                            {record.publishYear || 2026}
                        </Tag>
                    </div>
                </div>
            ),
        },
        {
            title: 'Thông Tin Đề Tài / Tài Liệu',
            key: 'info',
            render: (_, record) => (
                <div className="space-y-1 max-w-md">
                    <div className="font-black text-sm text-stone-900 leading-snug hover:text-amber-800 transition-colors">
                        {record.title}
                    </div>
                    <div className="text-xs text-stone-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>
                            Tác giả: <strong className="text-stone-700">{record.author}</strong>
                        </span>
                        {record.advisor && (
                            <span>
                                GVHD: <strong className="text-amber-800">{record.advisor}</strong>
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                        <Tag color="blue" className="text-[10px] font-bold rounded-md">
                            {record.documentType === 'thesis' ? 'Đồ án / Luận văn' : record.documentType === 'ebook' ? 'E-Book' : record.documentType}
                        </Tag>
                        <Tag color="purple" className="text-[10px] font-bold rounded-md">
                            Khoa: {record.category}
                        </Tag>
                        <span className="text-[11px] text-stone-400">
                            {record.pages} trang ({record.fileSize || '5MB'})
                        </span>
                    </div>
                </div>
            ),
        },
        {
            title: 'Đọc Thử & Giá Bán',
            key: 'pricing',
            width: 150,
            render: (_, record) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold">
                        {Number(record.price) === 0 ? (
                            <Tag color="emerald" className="font-black text-xs px-2 py-0.5 rounded-lg border-emerald-300">
                                Miễn Phí Đọc
                            </Tag>
                        ) : (
                            <span className="text-amber-800 font-extrabold text-sm">
                                {Number(record.price).toLocaleString('vi-VN')} đ
                            </span>
                        )}
                    </div>
                    <div className="text-[11px] text-stone-500">
                        Đọc thử: <strong className="text-stone-700">{record.previewPages || 5} trang</strong>
                    </div>
                </div>
            ),
        },
        {
            title: 'Lượt Xem & Tải',
            key: 'stats',
            width: 120,
            render: (_, record) => (
                <div className="text-xs space-y-1 text-stone-600">
                    <div className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-stone-400" />
                        <span>{record.viewCount || 0} lượt</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Download className="w-3.5 h-3.5 text-stone-400" />
                        <span>{record.downloadCount || 0} tải</span>
                    </div>
                </div>
            ),
        },
        {
            title: 'Trạng Thái',
            key: 'status',
            width: 110,
            render: (_, record) => (
                <Tag
                    color={record.status === 'active' ? 'success' : 'default'}
                    className="font-bold text-xs px-2.5 py-1 rounded-xl cursor-pointer"
                    onClick={() => handleToggleStatus(record.id)}
                >
                    {record.status === 'active' ? 'Khả Dụng' : 'Đang Ẩn'}
                </Tag>
            ),
        },
        {
            title: 'Thao Tác',
            key: 'action',
            width: 130,
            render: (_, record) => (
                <div className="flex items-center gap-1.5">
                    <Tooltip title="Xem File PDF">
                        <a
                            href={record.pdfFile}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </Tooltip>

                    <Tooltip title="Chỉnh sửa tài liệu">
                        <Button
                            type="text"
                            size="small"
                            icon={<Edit3 className="w-4 h-4 text-amber-700" />}
                            onClick={() => handleOpenModal(record)}
                            className="hover:bg-amber-50 rounded-lg"
                        />
                    </Tooltip>

                    <Popconfirm
                        title="Xác nhận xóa tài liệu số?"
                        description="Hành động này không thể hoàn tác."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa tài liệu">
                            <Button type="text" size="small" icon={<Trash2 className="w-4 h-4 text-red-600" />} className="hover:bg-red-50 rounded-lg" />
                        </Tooltip>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    // Table Columns for Thesis Submissions (Phê duyệt đồ án)
    const submissionColumns = [
        {
            title: 'Ngày nộp',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 110,
            render: (text) => (
                <div className="text-xs text-stone-500 font-medium">
                    {new Date(text).toLocaleDateString('vi-VN')}
                </div>
            ),
        },
        {
            title: 'Tên Đề Tài & Tóm Tắt',
            key: 'title',
            render: (_, r) => (
                <div className="space-y-1 max-w-sm">
                    <div className="font-extrabold text-sm text-stone-900 leading-snug">{r.title}</div>
                    <p className="text-xs text-stone-500 line-clamp-2 bg-stone-50 p-2 rounded-lg border border-stone-100">
                        {r.abstract}
                    </p>
                </div>
            ),
        },
        {
            title: 'Sinh Viên & GVHD',
            key: 'student',
            width: 200,
            render: (_, r) => (
                <div className="text-xs space-y-1 text-stone-700">
                    <div>
                        Sinh viên: <strong className="text-stone-900">{r.studentName}</strong>
                    </div>
                    <div className="font-mono text-stone-500">MSSV: {r.studentId}</div>
                    <div>
                        GVHD: <span className="font-semibold text-amber-800">{r.advisor}</span>
                    </div>
                    <Tag color="stone" className="text-[10px] mt-0.5">
                        Khoa {r.faculty}
                    </Tag>
                </div>
            ),
        },
        {
            title: 'File PDF & Loại hình',
            key: 'file',
            width: 140,
            render: (_, r) => (
                <div className="space-y-1.5">
                    <Tag color="purple" className="text-[10px] font-bold rounded-md">
                        {r.thesisType === 'bachelor' ? 'Khóa luận Cử nhân' : r.thesisType === 'master' ? 'Luận văn Thạc sĩ' : r.thesisType}
                    </Tag>
                    <div className="text-[11px] text-stone-500">{r.pages} trang ({r.fileSize || '5MB'})</div>
                    <a
                        href={r.pdfFile}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:underline"
                    >
                        <ExternalLink className="w-3.5 h-3.5" /> Xem PDF Toàn Văn
                    </a>
                </div>
            ),
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            width: 140,
            render: (status) => {
                if (status === 'approved') {
                    return (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Đã Duyệt
                        </span>
                    );
                }
                if (status === 'rejected') {
                    return (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
                            <XCircle className="w-3.5 h-3.5" /> Yêu Cầu Sửa
                        </span>
                    );
                }
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                        <Clock className="w-3.5 h-3.5" /> Chờ Duyệt
                    </span>
                );
            },
        },
        {
            title: 'Thao Tác Phê Duyệt',
            key: 'actions',
            width: 160,
            render: (_, r) => (
                <div className="flex flex-col gap-1.5">
                    {r.status === 'pending' ? (
                        <>
                            <Button
                                type="primary"
                                size="small"
                                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                                onClick={() => handleOpenApprove(r)}
                                className="bg-emerald-600 hover:bg-emerald-700 font-bold text-xs rounded-xl border-none shadow-xs"
                            >
                                Duyệt Lưu Chiểu
                            </Button>
                            <Button
                                size="small"
                                danger
                                icon={<XCircle className="w-3.5 h-3.5" />}
                                onClick={() => handleOpenReject(r)}
                                className="font-bold text-xs rounded-xl"
                            >
                                Trả Về / Từ Chối
                            </Button>
                        </>
                    ) : r.status === 'approved' ? (
                        <span className="text-xs text-stone-400 font-medium">Đã xuất bản vào Kho số</span>
                    ) : (
                        <Button
                            size="small"
                            type="dashed"
                            onClick={() => handleOpenApprove(r)}
                            className="text-xs font-bold rounded-xl"
                        >
                            Xem Lại & Duyệt
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="flex min-h-screen bg-[#faf9f6] text-stone-800 font-sans">
            {/* Admin Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <AdminTopbar title="Phân Hệ: Quản Lý & Phê Duyệt Tài Liệu Số / Đồ Án Lưu Chiểu" />

                <main className="p-6 md:p-8 w-full space-y-6 flex-1">
                    {/* Top Banner Header */}
                    <div className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white p-6 md:p-7 rounded-3xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                                <FileCheck className="w-4 h-4" />
                                <span>Thư Viện Tài Liệu Số & Đồ Án Tốt Nghiệp</span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                                Quản Lý Lưu Chiểu & Kinh Doanh Tài Liệu Số
                            </h2>
                            <p className="text-xs text-stone-300 max-w-2xl leading-relaxed">
                                Tiếp nhận, kiểm duyệt hồ sơ khóa luận/luận văn sinh viên nộp, quản lý file PDF số hóa, đọc thử 5 trang và cấu hình lưu chiểu học thuật toàn trường.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button
                                icon={<RefreshCw className="w-4 h-4" />}
                                onClick={() => {
                                    fetchDocs();
                                    fetchSubmissions();
                                }}
                                className="rounded-2xl font-bold text-xs bg-stone-800 text-white border-stone-700 hover:bg-stone-700 h-11 px-4"
                            >
                                Làm Mới
                            </Button>
                            {mainMode === 'docs' && (
                                <Button
                                    type="primary"
                                    icon={<Plus className="w-4 h-4" />}
                                    onClick={() => handleOpenModal()}
                                    className="rounded-2xl font-extrabold text-xs bg-amber-600 hover:bg-amber-700 border-none h-11 px-5 shadow-sm"
                                >
                                    + Thêm Đồ Án / Tài Liệu Số
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Stats Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
                            <div>
                                <div className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider">
                                    Đã Xuất Bản Trên Kho Số
                                </div>
                                <div className="text-2xl font-black text-stone-900 mt-1">{totalDocsCount} bản</div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20 shadow-2xs">
                                <FileText className="w-6 h-6 stroke-[2.2]" />
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
                            <div>
                                <div className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider">
                                    Đồ Án Chờ Duyệt Nộp
                                </div>
                                <div className="text-2xl font-black text-amber-600 mt-1">{pendingSubmissionsCount} hồ sơ</div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20 shadow-2xs">
                                <Clock className="w-6 h-6 stroke-[2.2]" />
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
                            <div>
                                <div className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider">
                                    Đồ Án / Luận Văn Đã Duyệt
                                </div>
                                <div className="text-2xl font-black text-purple-700 mt-1">{thesisCount} đề tài</div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center border border-purple-500/20 shadow-2xs">
                                <GraduationCap className="w-6 h-6 stroke-[2.2]" />
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
                            <div>
                                <div className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider">
                                    Sách Điện Tử (E-Book)
                                </div>
                                <div className="text-2xl font-black text-blue-700 mt-1">{ebookCount} cuốn</div>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20 shadow-2xs">
                                <BookOpen className="w-6 h-6 stroke-[2.2]" />
                            </div>
                        </div>
                    </div>

                    {/* Main Mode Tabs Switch */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setMainMode('docs')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs transition-all cursor-pointer shadow-sm ${
                                mainMode === 'docs'
                                    ? 'bg-stone-900 text-white shadow-stone-900/20 scale-[1.02]'
                                    : 'bg-white text-stone-600 hover:bg-amber-50/60 border border-stone-200'
                            }`}
                        >
                            <FileText className="w-4 h-4 text-amber-500" />
                            Kho Tài Liệu Số Đã Xuất Bản ({docs.length})
                        </button>

                        <button
                            onClick={() => setMainMode('submissions')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs transition-all cursor-pointer shadow-sm ${
                                mainMode === 'submissions'
                                    ? 'bg-stone-900 text-white shadow-stone-900/20 scale-[1.02]'
                                    : 'bg-white text-stone-600 hover:bg-amber-50/60 border border-stone-200'
                            }`}
                        >
                            <GraduationCap className="w-4 h-4 text-amber-500" />
                            Phê Duyệt Đồ Án / Luận Văn Sinh Viên Nộp
                            {pendingSubmissionsCount > 0 && (
                                <span className="bg-amber-500 text-stone-950 font-black text-[11px] px-2 py-0.5 rounded-full">
                                    {pendingSubmissionsCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* MODE 1: KHO TÀI LIỆU SỐ ĐÃ XUẤT BẢN */}
                    {mainMode === 'docs' && (
                        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <Input
                                    placeholder="Tìm kiếm theo mã tài liệu, tên đề tài, tác giả hoặc GVHD..."
                                    prefix={<Search className="w-4 h-4 text-stone-400 mr-1" />}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    allowClear
                                    className="rounded-xl text-xs font-medium max-w-md w-full h-10"
                                />

                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <Select
                                        value={selectedCategory}
                                        onChange={setSelectedCategory}
                                        options={categoryOptions}
                                        className="w-52 text-xs font-semibold"
                                    />

                                    <Select
                                        value={selectedDocType}
                                        onChange={setSelectedDocType}
                                        options={docTypeOptions}
                                        className="w-52 text-xs font-semibold"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-stone-100 pt-3">
                                <Tabs
                                    activeKey={statusTab}
                                    onChange={setStatusTab}
                                    items={[
                                        { key: 'all', label: `Tất Cả (${docs.length})` },
                                        { key: 'active', label: `Đang Khả Dụng (${docs.filter((d) => d.status === 'active').length})` },
                                        { key: 'hidden', label: `Đang Ẩn (${docs.filter((d) => d.status === 'hidden').length})` },
                                    ]}
                                    className="custom-status-tabs font-bold"
                                />
                            </div>

                            <Table
                                columns={columns}
                                dataSource={filteredDocs}
                                rowKey="id"
                                loading={loading}
                                pagination={{ pageSize: 10, showSizeChanger: true }}
                                className="custom-admin-table text-xs"
                            />
                        </div>
                    )}

                    {/* MODE 2: PHÊ DUYỆT ĐỒ ÁN / LUẬN VĂN NỘP */}
                    {mainMode === 'submissions' && (
                        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <Input
                                    placeholder="Tìm theo MSSV, tên sinh viên, tên đề tài hoặc GVHD..."
                                    prefix={<Search className="w-4 h-4 text-stone-400 mr-1" />}
                                    value={submissionSearch}
                                    onChange={(e) => setSubmissionSearch(e.target.value)}
                                    allowClear
                                    className="rounded-xl text-xs font-medium max-w-md w-full h-10"
                                />

                                <Tabs
                                    activeKey={submissionFilterStatus}
                                    onChange={setSubmissionFilterStatus}
                                    items={[
                                        { key: 'all', label: `Tất Cả (${submissions.length})` },
                                        { key: 'pending', label: `Chờ Duyệt (${submissions.filter((s) => s.status === 'pending').length})` },
                                        { key: 'approved', label: `Đã Duyệt (${submissions.filter((s) => s.status === 'approved').length})` },
                                        { key: 'rejected', label: `Bị Từ Chối (${submissions.filter((s) => s.status === 'rejected').length})` },
                                    ]}
                                    className="custom-status-tabs font-bold"
                                />
                            </div>

                            <Table
                                columns={submissionColumns}
                                dataSource={filteredSubmissions}
                                rowKey="id"
                                loading={loadingSubmissions}
                                pagination={{ pageSize: 10, showSizeChanger: true }}
                                className="custom-admin-table text-xs"
                            />
                        </div>
                    )}
                </main>
            </div>

            {/* Modal Add / Edit Digital Doc */}
            <Modal
                title={
                    <div className="flex items-center gap-2 font-black text-stone-900 text-base">
                        <FileCheck className="w-5 h-5 text-amber-600" />
                        <span>{editingDoc ? 'Chỉnh Sửa Tài Liệu Số / Đồ Án' : 'Thêm Mới Đồ Án / Tài Liệu Số'}</span>
                    </div>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={720}
                className="rounded-3xl"
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-3 pt-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Form.Item label={<span className="font-bold text-xs text-stone-700">Mã Tài Liệu / Lưu Chiểu *</span>} name="docCode" rules={[{ required: true }]}>
                            <Input placeholder="THESIS-2026-001" className="rounded-xl text-xs font-mono font-bold" />
                        </Form.Item>

                        <Form.Item label={<span className="font-bold text-xs text-stone-700">Chuyên Ngành / Khoa *</span>} name="category" rules={[{ required: true }]}>
                            <Select options={categoryOptions.filter((c) => c.value !== 'all')} className="rounded-xl text-xs" />
                        </Form.Item>
                    </div>

                    <Form.Item label={<span className="font-bold text-xs text-stone-700">Tên Đề Tài / Tiêu Đề Tài Liệu *</span>} name="title" rules={[{ required: true }]}>
                        <Input placeholder="Xây dựng hệ sinh thái thư viện số..." className="rounded-xl text-xs font-semibold" />
                    </Form.Item>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Form.Item label={<span className="font-bold text-xs text-stone-700">Tác Giả / Sinh Viên Thực Hiện *</span>} name="author" rules={[{ required: true }]}>
                            <Input placeholder="Nguyễn Văn A (MSSV: 2022001)" className="rounded-xl text-xs" />
                        </Form.Item>

                        <Form.Item label={<span className="font-bold text-xs text-stone-700">Giảng Viên Hướng Dẫn (Nếu có)</span>} name="advisor">
                            <Input placeholder="PGS.TS. Trần Minh Khoa" className="rounded-xl text-xs" />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <Form.Item label={<span className="font-bold text-xs text-stone-700">Loại Tài Liệu *</span>} name="documentType" rules={[{ required: true }]}>
                            <Select options={docTypeOptions.filter((d) => d.value !== 'all')} className="rounded-xl text-xs" />
                        </Form.Item>

                        <Form.Item label={<span className="font-bold text-xs text-stone-700">Năm Bảo Vệ / XB</span>} name="publishYear">
                            <InputNumber min={2000} max={2030} className="w-full rounded-xl text-xs" />
                        </Form.Item>

                        <Form.Item label={<span className="font-bold text-xs text-stone-700">Số Trang</span>} name="pages">
                            <InputNumber min={1} className="w-full rounded-xl text-xs" />
                        </Form.Item>

                        <Form.Item label={<span className="font-bold text-xs text-stone-700">Đọc Thử (Trang)</span>} name="previewPages">
                            <InputNumber min={1} max={50} className="w-full rounded-xl text-xs" />
                        </Form.Item>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Form.Item label={<span className="font-bold text-xs text-stone-700">Giá Bán Bản Quyền (0đ = Miễn phí đọc)</span>} name="price">
                            <InputNumber min={0} step={10000} formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} className="w-full rounded-xl text-xs font-bold text-amber-800" />
                        </Form.Item>

                        <Form.Item label={<span className="font-bold text-xs text-stone-700">Dung Lượng File</span>} name="fileSize">
                            <Input placeholder="5.2 MB" className="rounded-xl text-xs" />
                        </Form.Item>
                    </div>

                    {/* PDF Upload */}
                    <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-stone-700 flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-amber-600" /> File PDF Toàn Văn Gốc *
                            </span>
                            {pdfFileValue && (
                                <a href={pdfFileValue} target="_blank" rel="noreferrer" className="text-xs text-amber-700 font-bold hover:underline">
                                    Xem thử file PDF hiện tại
                                </a>
                            )}
                        </div>

                        {uploadedPdfName ? (
                            <div className="text-xs text-emerald-800 font-bold bg-emerald-50 p-2 rounded-lg flex items-center justify-between">
                                <span>Đã chọn file: {uploadedPdfName}</span>
                                <label className="text-amber-800 underline cursor-pointer text-[11px]">
                                    Chọn file khác
                                    <input type="file" accept=".pdf" onChange={handlePdfFileChange} className="hidden" />
                                </label>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-stone-300 rounded-xl cursor-pointer hover:bg-stone-100 transition-colors">
                                <input type="file" accept=".pdf" onChange={handlePdfFileChange} className="hidden" />
                                <div className="text-xs text-stone-600 font-semibold">{uploadingPdf ? 'Đang tải file PDF lên...' : 'Chọn file PDF từ máy tính'}</div>
                            </label>
                        )}
                    </div>

                    {/* Cover Upload */}
                    <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2">
                        <span className="font-bold text-xs text-stone-700">Ảnh Bìa Tài Liệu (Cover Image)</span>
                        {coverImageValue && (
                            <div className="flex items-center gap-3">
                                <img src={coverImageValue} alt="Cover" className="w-12 h-16 object-cover rounded-lg border" />
                                <label className="text-xs text-amber-800 font-bold underline cursor-pointer">
                                    {uploadingCover ? 'Đang tải...' : 'Tải ảnh bìa khác'}
                                    <input type="file" accept="image/*" onChange={handleCoverImageChange} className="hidden" />
                                </label>
                            </div>
                        )}
                    </div>

                    <Form.Item label={<span className="font-bold text-xs text-stone-700">Tóm Tắt Nội Dung / Mô Tả Đề Tài</span>} name="description">
                        <Input.TextArea rows={3} placeholder="Nhập tóm tắt đề tài hoặc mô tả sơ lược..." className="rounded-xl text-xs" />
                    </Form.Item>

                    <div className="flex items-center justify-between bg-stone-100 p-3 rounded-xl">
                        <span className="font-bold text-xs text-stone-700">Trạng thái Bật Bán / Khả Dụng</span>
                        <Form.Item name="status" valuePropName="checked" className="mb-0">
                            <Switch checkedChildren="Khả dụng" unCheckedChildren="Ẩn" />
                        </Form.Item>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
                        <Button onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold text-xs">
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={submitting}
                            className="rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-700 border-none px-6"
                        >
                            Lưu Thông Tin Tài Liệu
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Modal Approve Submission */}
            <Modal
                title={
                    <div className="flex items-center gap-2 font-black text-stone-900 text-base">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>Phê Duyệt & Xuất Bản Đồ Án Lưu Chiểu</span>
                    </div>
                }
                open={approveModalVisible}
                onCancel={() => setApproveModalVisible(false)}
                footer={null}
                width={600}
                className="rounded-3xl"
            >
                {selectedSubmission && (
                    <Form form={approveForm} layout="vertical" onFinish={handleFinishApprove} className="space-y-3 pt-3">
                        <Alert
                            type="info"
                            showIcon
                            message={<span className="font-bold text-xs">Thông tin đồ án sinh viên nộp:</span>}
                            description={
                                <div className="text-xs space-y-0.5 mt-1">
                                    <div><strong>Đề tài:</strong> {selectedSubmission.title}</div>
                                    <div><strong>Tác giả:</strong> {selectedSubmission.studentName} ({selectedSubmission.studentId})</div>
                                    <div><strong>GVHD:</strong> {selectedSubmission.advisor}</div>
                                </div>
                            }
                            className="rounded-xl"
                        />

                        <Form.Item label={<span className="font-bold text-xs">Mã Lưu Chiểu Số Tự Động / Tùy Chỉnh *</span>} name="customDocCode" rules={[{ required: true }]}>
                            <Input className="rounded-xl font-mono font-bold" />
                        </Form.Item>

                        <div className="grid grid-cols-2 gap-3">
                            <Form.Item label={<span className="font-bold text-xs">Chuyên ngành / Khoa</span>} name="category">
                                <Select options={categoryOptions.filter((c) => c.value !== 'all')} className="rounded-xl text-xs" />
                            </Form.Item>

                            <Form.Item label={<span className="font-bold text-xs">Số trang cho đọc thử</span>} name="previewPages">
                                <InputNumber min={1} max={30} className="w-full rounded-xl text-xs" />
                            </Form.Item>
                        </div>

                        <Form.Item label={<span className="font-bold text-xs">Đơn giá bản quyền (0 VNĐ = Miễn phí đọc cho bạn đọc)</span>} name="price">
                            <InputNumber min={0} step={10000} className="w-full rounded-xl text-xs font-bold text-amber-800" />
                        </Form.Item>

                        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                            <Button onClick={() => setApproveModalVisible(false)} className="rounded-xl font-bold text-xs">
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit" loading={submitting} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold text-xs border-none px-6">
                                Xác Nhận Duyệt & Xuất Bản
                            </Button>
                        </div>
                    </Form>
                )}
            </Modal>

            {/* Modal Reject Submission */}
            <Modal
                title={
                    <div className="flex items-center gap-2 font-black text-stone-900 text-base">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <span>Từ Chối / Yêu Cầu Sinh Viên Chỉnh Sửa</span>
                    </div>
                }
                open={rejectModalVisible}
                onCancel={() => setRejectModalVisible(false)}
                footer={null}
                width={500}
                className="rounded-3xl"
            >
                <Form form={rejectForm} layout="vertical" onFinish={handleFinishReject} className="space-y-3 pt-3">
                    <Form.Item
                        label={<span className="font-bold text-xs">Lý do từ chối & Hướng dẫn sinh viên chỉnh sửa *</span>}
                        name="rejectReason"
                        rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối!' }]}
                    >
                        <Input.TextArea rows={4} placeholder="Ví dụ: Thiếu chữ ký xác nhận của GVHD ở trang phụ bìa..." className="rounded-xl text-xs" />
                    </Form.Item>

                    <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                        <Button onClick={() => setRejectModalVisible(false)} className="rounded-xl font-bold text-xs">
                            Hủy
                        </Button>
                        <Button danger type="primary" htmlType="submit" loading={submitting} className="rounded-xl font-bold text-xs px-6">
                            Gửi Yêu Cầu Chỉnh Sửa
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}

export default DigitalDocManagementPage;
