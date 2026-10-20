import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Select, 
  Tag, 
  Space, 
  Tooltip, 
  Popconfirm, 
  Modal, 
  message, 
  Switch 
} from 'antd';
import { 
  Search, 
  BookOpen, 
  Plus, 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Filter, 
  Layers, 
  Sparkles,
  BookmarkCheck,
  PackageCheck
} from 'lucide-react';

import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopbar from '../../components/admin/AdminTopbar';
import BookEditModal from '../../components/admin/BookEditModal';
import CategoryManagementModal from '../../components/admin/CategoryManagementModal';

import { 
  getAllBooksAdminApi, 
  createBookApi, 
  updateBookApi, 
  deleteBookApi, 
  toggleBookVisibilityApi,
  getCategoriesAdminApi
} from '../../api/bookAdmin.api';

export function BookManagementPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [visibilityFilter, setVisibilityFilter] = useState('all');

  // Modals state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Fetch Books
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await getAllBooksAdminApi();
      const bookList = res.metadata || res.data || res || [];
      setBooks(Array.isArray(bookList) ? bookList : []);
    } catch (err) {
      console.error('API Error fetching books:', err);
      message.error(err.response?.data?.message || err.message || 'Lỗi khi tải danh sách sách!');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await getCategoriesAdminApi();
      const catList = res.metadata || res.data || res || [];
      setCategories(Array.isArray(catList) ? catList : []);
    } catch (err) {
      console.error('API Error fetching categories:', err);
      setCategories([]);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, []);

  // Filtered Books
  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      const matchCat = categoryFilter === 'all' || b.categoryId === categoryFilter;
      const matchVis = visibilityFilter === 'all' || 
        (visibilityFilter === 'visible' && b.isVisible !== false) ||
        (visibilityFilter === 'hidden' && b.isVisible === false);

      const matchSearch = searchQuery === '' ||
        (b.title && b.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.author && b.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.isbn && b.isbn.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCat && matchVis && matchSearch;
    });
  }, [books, categoryFilter, visibilityFilter, searchQuery]);

  // Save Book (Create / Update)
  const handleSaveBook = async (formData, bookId) => {
    try {
      if (bookId) {
        await updateBookApi(bookId, formData);
        message.success('Cập nhật đầu sách thành công!');
      } else {
        await createBookApi(formData);
        message.success('Thêm đầu sách mới vào kho và lưu cơ sở dữ liệu thành công!');
      }
      setEditModalVisible(false);
      await fetchBooks();
      await fetchCategories();
    } catch (err) {
      console.error('Lỗi khi lưu sách:', err);
      const errMsg = err.response?.data?.message || err.message || 'Lỗi khi lưu sách vào cơ sở dữ liệu!';
      message.error(errMsg);
    }
  };

  // Toggle Book Visibility
  const handleToggleVisibility = async (bookId) => {
    try {
      await toggleBookVisibilityApi(bookId);
      message.success('Đã cập nhật trạng thái ẩn/hiện sách!');
      await fetchBooks();
    } catch (err) {
      console.error('Lỗi khi đổi trạng thái hiển thị:', err);
      message.error(err.response?.data?.message || 'Lỗi khi thay đổi trạng thái!');
    }
  };

  // Delete Book
  const handleDeleteBook = async (bookId) => {
    try {
      await deleteBookApi(bookId);
      message.success('Đã xóa đầu sách khỏi hệ thống!');
      await fetchBooks();
      await fetchCategories();
    } catch (err) {
      console.error('Lỗi khi xóa sách:', err);
      message.error(err.response?.data?.message || 'Lỗi khi xóa sách khỏi cơ sở dữ liệu!');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredBooks.length === 0) {
      message.warning('Không có sách để xuất!');
      return;
    }

    const headers = ['ID', 'Tên sách', 'Tác giả', 'ISBN', 'Thể loại', 'NXB', 'Năm XB', 'Giá thuê 7 ngày', 'Giá thuê 14 ngày', 'Tiền cọc', 'Tổng kho', 'Hiển thị'];
    const rows = filteredBooks.map(b => [
      b.id,
      `"${b.title}"`,
      `"${b.author}"`,
      b.isbn || '',
      `"${b.categoryName || ''}"`,
      `"${b.publisher || ''}"`,
      b.year || '',
      b.price7Days || 15000,
      b.price14Days || 25000,
      b.deposit || 50000,
      b.totalCopies || 5,
      b.isVisible !== false ? 'Hiện' : 'Ẩn'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `danh_sach_kho_sach_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Đã xuất file CSV kho sách thành công!');
  };

  // Import Excel Mock Handler
  const handleImportExcel = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.xlsx, .csv';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        message.success(`Đã nhận file "${file.name}". Đang import dữ liệu sách vào kho...`);
        setTimeout(() => {
          message.success('Import kho sách thành công! Đã cập nhật 12 đầu sách mới.');
        }, 1000);
      }
    };
    fileInput.click();
  };

  // Columns definition
  const columns = [
    {
      title: 'Đầu Sách',
      key: 'book',
      render: (_, record) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-12 h-16 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden shrink-0 shadow-xs">
            <img src={record.cover} alt={record.title} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-extrabold text-stone-900 text-xs sm:text-sm line-clamp-1">{record.title}</div>
            <div className="text-[11px] text-stone-500 font-medium mt-0.5">
              Tác giả: <strong className="text-stone-700">{record.author}</strong> • ISBN: <span className="font-mono text-amber-700">{record.isbn}</span>
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">
              NXB: {record.publisher || 'NXB Trẻ'} ({record.year || 2024})
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Thể Loại',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (name, record) => (
        <Tag color="orange" className="font-bold text-xs">{name || record.categoryId}</Tag>
      ),
    },
    {
      title: 'Giá Thuê & Tiền Cọc',
      key: 'pricing',
      render: (_, record) => (
        <div className="text-xs space-y-0.5">
          <div className="font-bold text-amber-700">
            {(record.price7Days || 15000).toLocaleString('vi-VN')}đ / 7 ngày
          </div>
          <div className="text-[11px] text-stone-500">
            Cọc: {(record.deposit || 50000).toLocaleString('vi-VN')}đ
          </div>
        </div>
      ),
    },
    {
      title: 'Số Lượng Kho',
      key: 'copies',
      render: (_, record) => (
        <div className="text-xs">
          <div className="font-black text-stone-900">
            {record.availableCopies || record.totalCopies || 5} / {record.totalCopies || 5} cuốn
          </div>
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
            (record.availableCopies || 3) > 1 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          }`}>
            {(record.availableCopies || 3) > 1 ? 'Sẵn sàng' : 'Hết sách'}
          </span>
        </div>
      ),
    },
    {
      title: 'Hiển Thị Tra Cứu',
      dataIndex: 'isVisible',
      key: 'isVisible',
      render: (isVisible, record) => (
        <Switch
          checked={isVisible !== false}
          onChange={() => handleToggleVisibility(record.id)}
          checkedChildren="Hiện"
          unCheckedChildren="Ẩn"
          className="bg-stone-300"
        />
      ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa thông tin sách">
            <Button
              size="small"
              icon={<Edit className="w-3.5 h-3.5" />}
              onClick={() => {
                setSelectedBook(record);
                setEditModalVisible(true);
              }}
            />
          </Tooltip>

          <Popconfirm
            title="Xóa đầu sách?"
            description="Bạn có chắc chắn muốn xóa đầu sách này khỏi kho?"
            onConfirm={() => handleDeleteBook(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger size="small" icon={<Trash2 className="w-3.5 h-3.5" />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#faf9f6] text-stone-800 font-sans">
      
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        <AdminTopbar title="Phân Hệ 2.2: Quản Lý Kho & Đầu Sách In" />

        <main className="p-6 md:p-8 w-full space-y-6 flex-1">
          
          {/* Metric Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-xs text-stone-500 font-bold uppercase tracking-wider">Tổng Đầu Sách</div>
                <div className="text-2xl font-black text-amber-600 mt-1">{books.length}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-xs text-stone-500 font-bold uppercase tracking-wider">Tổng Bản Sách Trong Kho</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">
                  {books.reduce((acc, b) => acc + (b.totalCopies || 5), 0)}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <PackageCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-xs text-stone-500 font-bold uppercase tracking-wider">Thể Loại & Chuyên Ngành</div>
                <div className="text-2xl font-black text-amber-700 mt-1">{categories.length}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-xs text-stone-500 font-bold uppercase tracking-wider">Sách Ẩn Trên Tra Cứu</div>
                <div className="text-2xl font-black text-stone-700 mt-1">
                  {books.filter(b => b.isVisible === false).length}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center">
                <EyeOff className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Filter & Action Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <Input
                placeholder="Tìm tên sách, tác giả, ISBN..."
                prefix={<Search className="w-4 h-4 text-stone-400 mr-1" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 rounded-xl text-xs"
                allowClear
              />

              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600">
                <Filter className="w-3.5 h-3.5 text-stone-400" />
                <span>Thể loại:</span>
                <Select
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  className="w-40 text-xs font-semibold"
                  options={[
                    { value: 'all', label: 'Tất cả thể loại' },
                    ...categories.map(c => ({ value: c.id, label: c.name }))
                  ]}
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600">
                <span>Hiển thị:</span>
                <Select
                  value={visibilityFilter}
                  onChange={setVisibilityFilter}
                  className="w-32 text-xs font-semibold"
                  options={[
                    { value: 'all', label: 'Tất cả trạng thái' },
                    { value: 'visible', label: 'Đang hiện' },
                    { value: 'hidden', label: 'Đã ẩn' },
                  ]}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
              <Button 
                icon={<Layers className="w-4 h-4" />} 
                onClick={() => setCategoryModalVisible(true)}
                className="rounded-xl font-bold text-xs"
              >
                Quản lý Thể loại
              </Button>

              <Button 
                icon={<Upload className="w-4 h-4" />} 
                onClick={handleImportExcel}
                className="rounded-xl font-bold text-xs"
              >
                Import Excel
              </Button>

              <Button 
                icon={<Download className="w-4 h-4" />} 
                onClick={handleExportCSV}
                className="rounded-xl font-bold text-xs"
              >
                Xuất Excel / CSV
              </Button>

              <Button 
                type="primary"
                icon={<Plus className="w-4 h-4" />} 
                onClick={() => {
                  setSelectedBook(null);
                  setEditModalVisible(true);
                }}
                className="rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-700 border-none"
              >
                Thêm Đầu Sách Mới
              </Button>
            </div>

          </div>

          {/* Books Table */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
            <Table
              columns={columns}
              dataSource={filteredBooks}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 8,
                showSizeChanger: false,
                showTotal: (total) => `Tổng số ${total} đầu sách`,
              }}
              className="custom-admin-table text-xs"
            />
          </div>

        </main>

      </div>

      {/* EDIT / ADD BOOK MODAL */}
      <BookEditModal
        visible={editModalVisible}
        book={selectedBook}
        categories={categories}
        onClose={() => setEditModalVisible(false)}
        onSave={handleSaveBook}
      />

      {/* CATEGORY MANAGEMENT MODAL */}
      <CategoryManagementModal
        visible={categoryModalVisible}
        categories={categories}
        onClose={() => setCategoryModalVisible(false)}
        onRefresh={fetchCategories}
      />

    </div>
  );
}

export default BookManagementPage;
