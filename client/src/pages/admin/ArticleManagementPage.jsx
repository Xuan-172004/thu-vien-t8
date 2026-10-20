import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Input,
    Select,
    Tag,
    Modal,
    Form,
    Switch,
    Popconfirm,
    message,
    Space,
    Tooltip,
} from 'antd';
import {
    Newspaper,
    Plus,
    Search,
    Edit3,
    Trash2,
    Eye,
    ExternalLink,
    Sparkles,
    Calendar,
    FileText,
    CheckCircle2,
    Clock,
} from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopbar from '../../components/admin/AdminTopbar';
import {
    getAllArticlesPublicApi,
    createArticleAdminApi,
    updateArticleAdminApi,
    deleteArticleAdminApi,
    toggleArticleStatusAdminApi,
} from '../../api/article.api';

const { Option } = Select;
const { TextArea } = Input;

const categoryTagMap = {
    news: { label: 'Tin Tức', color: 'blue' },
    notice: { label: 'Thông Báo', color: 'red' },
    event: { label: 'Sự Kiện', color: 'gold' },
    guide: { label: 'Hướng Dẫn', color: 'green' },
};

export function ArticleManagementPage() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal Add / Edit
    const [modalOpen, setModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState(null);
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const fetchArticles = async (p = page, ps = pageSize, s = search, cat = categoryFilter, st = statusFilter) => {
        setLoading(true);
        try {
            const params = {
                page: p,
                limit: ps,
            };
            if (s && s.trim()) params.search = s.trim();
            if (cat && cat !== 'all') params.category = cat;
            if (st && st !== 'all') params.status = st;

            const res = await getAllArticlesPublicApi(params);
            const data = res.metadata || res.data || {};
            setArticles(data.articles || []);
            setTotal(data.total || 0);
            setPage(data.page || 1);
        } catch (err) {
            message.error(err.message || 'Lỗi khi tải danh sách bài viết!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles(1, pageSize, search, categoryFilter, statusFilter);
    }, [categoryFilter, statusFilter]);

    const handleOpenCreate = () => {
        setEditingArticle(null);
        form.resetFields();
        form.setFieldsValue({
            category: 'news',
            status: 'published',
            isFeatured: false,
            thumbnail: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
        });
        setModalOpen(true);
    };

    const handleOpenEdit = (record) => {
        setEditingArticle(record);
        form.setFieldsValue({
            title: record.title,
            category: record.category,
            status: record.status,
            isFeatured: record.isFeatured,
            thumbnail: record.thumbnail,
            summary: record.summary,
            content: record.content,
            eventDate: record.eventDate,
            eventLocation: record.eventLocation,
        });
        setModalOpen(true);
    };

    const handleSubmitForm = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);

            if (editingArticle) {
                await updateArticleAdminApi(editingArticle.id, values);
                message.success('Cập nhật bài viết thành công!');
            } else {
                await createArticleAdminApi(values);
                message.success('Tạo bài viết mới thành công!');
            }

            setModalOpen(false);
            fetchArticles(page, pageSize, search, categoryFilter, statusFilter);
        } catch (err) {
            if (err?.errorFields) return;
            message.error(err.message || 'Lưu bài viết thất bại!');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteArticleAdminApi(id);
            message.success('Đã xóa bài viết thành công!');
            fetchArticles(page, pageSize, search, categoryFilter, statusFilter);
        } catch (err) {
            message.error(err.message || 'Xóa bài viết thất bại!');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await toggleArticleStatusAdminApi(id);
            message.success('Đã thay đổi trạng thái bài viết!');
            fetchArticles(page, pageSize, search, categoryFilter, statusFilter);
        } catch (err) {
            message.error(err.message || 'Lỗi thay đổi trạng thái!');
        }
    };

    const columns = [
        {
            title: 'Bài Viết / Tiêu Đề',
            dataIndex: 'title',
            key: 'title',
            render: (text, record) => (
                <div className="flex items-start gap-3 max-w-md">
                    <img
                        src={record.thumbnail}
                        alt={text}
                        className="w-14 h-12 rounded-xl object-cover border border-stone-200 shrink-0 mt-0.5"
                    />
                    <div className="space-y-1 min-w-0">
                        <div className="font-extrabold text-stone-900 text-xs leading-snug line-clamp-2">
                            {text}
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">
                            /{record.slug}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Chuyên Mục',
            dataIndex: 'category',
            key: 'category',
            width: 130,
            render: (cat) => {
                const conf = categoryTagMap[cat] || { label: cat, color: 'default' };
                return <Tag color={conf.color} className="font-bold text-[10px]">{conf.label}</Tag>;
            },
        },
        {
            title: 'Lượt Xem',
            dataIndex: 'views',
            key: 'views',
            width: 100,
            render: (views) => (
                <span className="font-extrabold text-stone-700 text-xs flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-stone-400" />
                    {views || 0}
                </span>
            ),
        },
        {
            title: 'Nổi Bật',
            dataIndex: 'isFeatured',
            key: 'isFeatured',
            width: 100,
            render: (isFeatured) => (
                isFeatured ? (
                    <Tag color="gold" className="font-bold text-[10px]">⭐ Nổi bật</Tag>
                ) : (
                    <span className="text-stone-400 text-xs font-semibold">-</span>
                )
            ),
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            key: 'status',
            width: 130,
            render: (status, record) => (
                <button
                    onClick={() => handleToggleStatus(record.id)}
                    className="cursor-pointer"
                    title="Bấm để chuyển đổi Đã đăng / Bản nháp"
                >
                    {status === 'published' ? (
                        <Tag color="success" className="font-bold text-[10px]">ĐÃ ĐĂNG</Tag>
                    ) : (
                        <Tag color="default" className="font-bold text-[10px]">BẢN NHÁP</Tag>
                    )}
                </button>
            ),
        },
        {
            title: 'Ngày Đăng',
            dataIndex: 'publishedAt',
            key: 'publishedAt',
            width: 120,
            render: (d) => (
                <span className="text-[11px] text-stone-500 font-medium">
                    {d ? new Date(d).toLocaleDateString('vi-VN') : 'Chưa đăng'}
                </span>
            ),
        },
        {
            title: 'Thao Tác',
            key: 'action',
            width: 130,
            align: 'right',
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Xem bài viết trên trang chủ">
                        <Button
                            type="text"
                            size="small"
                            icon={<ExternalLink className="w-4 h-4 text-stone-500 hover:text-amber-600" />}
                            onClick={() => window.open(`/articles/${record.slug}`, '_blank')}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa bài viết">
                        <Button
                            type="text"
                            size="small"
                            icon={<Edit3 className="w-4 h-4 text-stone-500 hover:text-indigo-600" />}
                            onClick={() => handleOpenEdit(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa bài viết này?"
                        description="Hành động này không thể hoàn tác!"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button
                                type="text"
                                size="small"
                                danger
                                icon={<Trash2 className="w-4 h-4 text-stone-400 hover:text-rose-600" />}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="flex h-screen bg-[#faf9f6] text-stone-800 font-sans overflow-hidden">
            <AdminSidebar />

            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
                <AdminTopbar title="Quản Lý Tin Tức, Thông Báo & Sự Kiện" />

                <main className="p-6 md:p-8 space-y-6 w-full">
                    {/* TOP ACTION BAR */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-stone-200 shadow-sm">
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Search */}
                            <Input
                                placeholder="Tìm kiếm bài viết..."
                                prefix={<Search className="w-4 h-4 text-stone-400 mr-1" />}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onPressEnter={() => fetchArticles(1, pageSize, search, categoryFilter, statusFilter)}
                                className="w-56 rounded-xl h-10 text-xs"
                                allowClear
                            />

                            {/* Category Filter */}
                            <Select
                                value={categoryFilter}
                                onChange={setCategoryFilter}
                                className="w-44 h-10 text-xs rounded-xl"
                            >
                                <Option value="all">Tất Cả Danh Mục</Option>
                                <Option value="news">Tin Tức</Option>
                                <Option value="notice">Thông Báo</Option>
                                <Option value="event">Sự Kiện</Option>
                                <Option value="guide">Hướng Dẫn</Option>
                            </Select>

                            {/* Status Filter */}
                            <Select
                                value={statusFilter}
                                onChange={setStatusFilter}
                                className="w-36 h-10 text-xs rounded-xl"
                            >
                                <Option value="all">Tất Cả Trạng Thái</Option>
                                <Option value="published">Đã Đăng</Option>
                                <Option value="draft">Bản Nháp</Option>
                            </Select>
                        </div>

                        <Button
                            type="primary"
                            icon={<Plus className="w-4 h-4" />}
                            onClick={handleOpenCreate}
                            className="bg-amber-600 hover:bg-amber-700 border-none font-bold text-xs h-10 px-5 rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                            Tạo Bài Viết Mới
                        </Button>
                    </div>

                    {/* TABLE */}
                    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden p-2">
                        <Table
                            columns={columns}
                            dataSource={articles}
                            rowKey="id"
                            loading={loading}
                            pagination={{
                                current: page,
                                pageSize: pageSize,
                                total: total,
                                onChange: (p, ps) => fetchArticles(p, ps, search, categoryFilter, statusFilter),
                                showSizeChanger: true,
                                pageSizeOptions: ['10', '20', '50'],
                            }}
                            className="custom-table"
                        />
                    </div>
                </main>
            </div>

            {/* MODAL CREATE / EDIT ARTICLE */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-stone-900 font-black text-base">
                        <Newspaper className="w-5 h-5 text-amber-600" />
                        <span>{editingArticle ? 'Chỉnh Sửa Bài Viết' : 'Tạo Bài Viết Mới'}</span>
                    </div>
                }
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={handleSubmitForm}
                confirmLoading={submitting}
                okText={editingArticle ? 'Lưu Thay Đổi' : 'Đăng Bài Viết'}
                cancelText="Hủy Bỏ"
                okButtonProps={{ className: 'bg-amber-600 hover:bg-amber-700 font-bold rounded-xl' }}
                cancelButtonProps={{ className: 'rounded-xl font-bold' }}
                width={800}
                className="rounded-3xl"
            >
                <Form form={form} layout="vertical" className="pt-3 space-y-3 font-sans">
                    <Form.Item
                        name="title"
                        label={<span className="font-bold text-xs">Tiêu đề bài viết</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài viết!' }]}
                    >
                        <Input placeholder="Nhập tiêu đề tin tức, thông báo..." className="rounded-xl h-10 text-xs font-bold" />
                    </Form.Item>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Form.Item
                            name="category"
                            label={<span className="font-bold text-xs">Chuyên mục</span>}
                            rules={[{ required: true }]}
                        >
                            <Select className="h-10 text-xs rounded-xl">
                                <Option value="news">Tin Tức</Option>
                                <Option value="notice">Thông Báo</Option>
                                <Option value="event">Sự Kiện</Option>
                                <Option value="guide">Hướng Dẫn</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="status"
                            label={<span className="font-bold text-xs">Trạng thái</span>}
                            rules={[{ required: true }]}
                        >
                            <Select className="h-10 text-xs rounded-xl">
                                <Option value="published">Đăng Công Khai</Option>
                                <Option value="draft">Lưu Bản Nháp</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="isFeatured"
                            label={<span className="font-bold text-xs">Đặt làm Tin Nổi Bật</span>}
                            valuePropName="checked"
                        >
                            <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="thumbnail"
                        label={<span className="font-bold text-xs">Ảnh bìa Thumbnail (URL)</span>}
                    >
                        <Input placeholder="https://images.unsplash.com/..." className="rounded-xl h-10 text-xs font-mono" />
                    </Form.Item>

                    <Form.Item
                        name="summary"
                        label={<span className="font-bold text-xs">Tóm tắt ngắn (Hiển thị ngoài danh mục)</span>}
                    >
                        <TextArea rows={2} placeholder="Nhập đoạn tóm tắt 1-2 câu..." className="rounded-xl text-xs" />
                    </Form.Item>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Form.Item
                            name="eventDate"
                            label={<span className="font-bold text-xs">Thời gian sự kiện (Nếu là sự kiện)</span>}
                        >
                            <Input placeholder="VD: 15 - 18/03/2026 (08:00 - 17:30)" className="rounded-xl h-10 text-xs" />
                        </Form.Item>

                        <Form.Item
                            name="eventLocation"
                            label={<span className="font-bold text-xs">Địa điểm tổ chức (Nếu là sự kiện)</span>}
                        >
                            <Input placeholder="VD: Sảnh chính Thư Viện Tầng 1" className="rounded-xl h-10 text-xs" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="content"
                        label={<span className="font-bold text-xs">Nội dung chi tiết (HTML / Văn bản)</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung bài viết!' }]}
                    >
                        <TextArea
                            rows={8}
                            placeholder="Nhập nội dung bài viết với các thẻ HTML: <h2>, <p>, <ul>, <li>, <strong>..."
                            className="rounded-xl text-xs font-mono"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default ArticleManagementPage;
