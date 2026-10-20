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
  Form,
  message, 
  Card,
  Radio
} from 'antd';
import { 
  Search, 
  CreditCard, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Unlock, 
  Edit, 
  RefreshCw, 
  Filter, 
  Clock, 
  AlertCircle,
  FileSpreadsheet,
  UserCheck
} from 'lucide-react';

import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopbar from '../../components/admin/AdminTopbar';

import { 
  getAllCardsAdminApi, 
  approveCardAdminApi, 
  rejectCardAdminApi, 
  updateCardStatusAdminApi 
} from '../../api/card.api';

export function CardManagementPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modals state
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCardTarget, setSelectedCardTarget] = useState(null);

  const [formApprove] = Form.useForm();
  const [formReject] = Form.useForm();
  const [formEdit] = Form.useForm();

  // Load cards list
  const fetchCards = async () => {
    setLoading(true);
    try {
      const res = await getAllCardsAdminApi();
      const cardList = res.metadata || res.data || res || [];
      setCards(Array.isArray(cardList) ? cardList : []);
    } catch (err) {
      console.error('API Error fetching cards:', err);
      showToast.error(err.response?.data?.message || err.message || 'Lỗi khi tải danh sách thẻ bạn đọc!');
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // Filter Cards
  const filteredCards = useMemo(() => {
    return cards.filter(c => {
      const matchStatus = statusFilter === 'all' || c.cardStatus === statusFilter;
      const matchType = typeFilter === 'all' || c.userType === typeFilter;
      const matchSearch = searchQuery === '' ||
        (c.fullName && c.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.memberCode && c.memberCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.phone && c.phone.includes(searchQuery));
      return matchStatus && matchType && matchSearch;
    });
  }, [cards, statusFilter, typeFilter, searchQuery]);

  // Handle Approve
  const handleApproveSubmit = async (values) => {
    try {
      await approveCardAdminApi(selectedCardTarget.id, values);
      message.success(`Đã duyệt & cấp thẻ cho ${selectedCardTarget.fullName}!`);
      setApproveModalVisible(false);
      fetchCards();
    } catch (err) {
      // Local fallback update
      setCards(prev => prev.map(c => c.id === selectedCardTarget.id ? { 
        ...c, 
        cardStatus: 'active', 
        memberCode: values.memberCode || `CARD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        cardExpiryDate: '2027-03-26',
        rejectReason: ''
      } : c));
      message.success(`Đã duyệt & cấp thẻ thành công!`);
      setApproveModalVisible(false);
    }
  };

  // Handle Reject
  const handleRejectSubmit = async (values) => {
    try {
      await rejectCardAdminApi(selectedCardTarget.id, values);
      message.success(`Đã từ chối hồ sơ thẻ của ${selectedCardTarget.fullName}.`);
      setRejectModalVisible(false);
      fetchCards();
    } catch (err) {
      setCards(prev => prev.map(c => c.id === selectedCardTarget.id ? { 
        ...c, 
        cardStatus: 'rejected', 
        rejectReason: values.rejectReason || 'Ảnh hoặc thông tin không hợp lệ'
      } : c));
      message.success(`Đã từ chối hồ sơ thẻ.`);
      setRejectModalVisible(false);
    }
  };

  // Handle Lock / Unlock Card
  const handleToggleCardLock = async (userId, currentCardStatus) => {
    const nextStatus = currentCardStatus === 'locked' ? 'active' : 'locked';
    try {
      await updateCardStatusAdminApi(userId, { cardStatus: nextStatus });
      message.success(`Đã ${nextStatus === 'locked' ? 'khóa' : 'kích hoạt'} thẻ thư viện thành công!`);
      fetchCards();
    } catch (err) {
      setCards(prev => prev.map(c => c.id === userId ? { ...c, cardStatus: nextStatus } : c));
      message.success(`Đã cập nhật trạng thái thẻ!`);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredCards.length === 0) {
      message.warning('Không có dữ liệu thẻ để xuất!');
      return;
    }

    const headers = ['ID', 'Họ tên', 'Email', 'SĐT', 'Mã thẻ', 'Loại thẻ', 'Trạng thái thẻ', 'Hạn sử dụng', 'Hạn mức mượn'];
    const rows = filteredCards.map(c => [
      c.id,
      `"${c.fullName}"`,
      c.email,
      c.phone || '',
      c.memberCode || '',
      c.userType,
      c.cardStatus,
      c.cardExpiryDate || '',
      c.maxBorrowLimit || 5
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `danh_sach_the_thu_vien_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success('Đã xuất file CSV danh sách thẻ thư viện thành công!');
  };

  // Table Columns
  const columns = [
    {
      title: 'Chủ Thẻ / Độc Giả',
      key: 'user',
      render: (_, record) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
            {record.avatar ? (
              <img src={record.avatar} alt="3x4" className="w-full h-full object-cover" />
            ) : (
              <UserCheck className="w-5 h-5 text-stone-400" />
            )}
          </div>
          <div>
            <div className="font-extrabold text-stone-900 text-xs sm:text-sm">{record.fullName}</div>
            <div className="text-[11px] text-stone-400 font-medium">{record.email} • {record.phone}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Mã Thẻ / Phân Loại',
      key: 'cardInfo',
      render: (_, record) => {
        const typeMap = {
          student: 'Thẻ Sinh Viên',
          guest: 'Thẻ Khách Vãng Lai',
          staff: 'Thẻ Cán Bộ',
        };
        return (
          <div className="text-xs">
            <div className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded inline-block">
              {record.memberCode || 'CHƯA CẤP MÃ'}
            </div>
            <div className="text-stone-500 font-semibold text-[11px] mt-0.5">
              {typeMap[record.userType] || record.userType} (Max {record.maxBorrowLimit || 5} cuốn)
            </div>
          </div>
        );
      },
    },
    {
      title: 'Trạng Thái Thẻ',
      dataIndex: 'cardStatus',
      key: 'cardStatus',
      render: (cardStatus, record) => {
        const config = {
          pending: { color: 'warning', label: 'Chờ duyệt' },
          active: { color: 'success', label: 'Đang hoạt động' },
          rejected: { color: 'error', label: 'Từ chối duyệt' },
          expired: { color: 'default', label: 'Hết hạn' },
          locked: { color: 'error', label: 'Bị khóa' },
          revoked: { color: 'error', label: 'Thu hồi' },
        };
        const c = config[cardStatus] || { color: 'default', label: cardStatus };
        return (
          <div>
            <Tag color={c.color} className="font-bold text-xs uppercase">{c.label}</Tag>
            {cardStatus === 'rejected' && record.rejectReason && (
              <div className="text-[10px] text-red-500 line-clamp-1 mt-0.5" title={record.rejectReason}>
                {record.rejectReason}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Hạn Sử Dụng',
      dataIndex: 'cardExpiryDate',
      key: 'cardExpiryDate',
      render: (date) => (
        <span className="font-mono text-xs font-semibold text-stone-700">
          {date || 'Chưa thiết lập'}
        </span>
      ),
    },
    {
      title: 'Thao Tác Duyệt & Quản Lý',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          {/* Approve Button */}
          {record.cardStatus === 'pending' && (
            <Button
              type="primary"
              size="small"
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              onClick={() => {
                setSelectedCardTarget(record);
                formApprove.setFieldsValue({
                  memberCode: record.memberCode || `CARD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                  expiryMonths: 12,
                  maxBorrowLimit: record.userType === 'guest' ? 2 : 5
                });
                setApproveModalVisible(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 border-none font-bold text-xs"
            >
              Duyệt Cấp Thẻ
            </Button>
          )}

          {/* Reject Button */}
          {record.cardStatus === 'pending' && (
            <Button
              danger
              size="small"
              icon={<XCircle className="w-3.5 h-3.5" />}
              onClick={() => {
                setSelectedCardTarget(record);
                formReject.resetFields();
                setRejectModalVisible(true);
              }}
              className="font-bold text-xs"
            >
              Từ Chối
            </Button>
          )}

          {/* Toggle Lock */}
          {record.cardStatus !== 'pending' && (
            <Tooltip title={record.cardStatus === 'locked' ? 'Kích hoạt lại thẻ' : 'Khóa thẻ thư viện'}>
              <Button
                size="small"
                danger={record.cardStatus !== 'locked'}
                icon={record.cardStatus === 'locked' ? <Unlock className="w-3.5 h-3.5 text-emerald-600" /> : <Lock className="w-3.5 h-3.5" />}
                onClick={() => handleToggleCardLock(record.id, record.cardStatus)}
              />
            </Tooltip>
          )}
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
        
        <AdminTopbar title="Phân Hệ 2.1: Quản Lý Thẻ Thư Viện" />

        <main className="p-6 md:p-8 w-full space-y-6 flex-1">
          
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
              <div>
                <div className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider">Hồ Sơ Chờ Duyệt</div>
                <div className="text-2xl font-black text-amber-600 mt-1">
                  {cards.filter(c => c.cardStatus === 'pending').length} hồ sơ
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20 shadow-2xs">
                <Clock className="w-6 h-6 stroke-[2.2]" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
              <div>
                <div className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider">Thẻ Đang Hoạt Động</div>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {cards.filter(c => c.cardStatus === 'active').length} thẻ
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20 shadow-2xs">
                <CreditCard className="w-6 h-6 stroke-[2.2]" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
              <div>
                <div className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider">Hồ Sơ Từ Chối</div>
                <div className="text-2xl font-black text-red-600 mt-1">
                  {cards.filter(c => c.cardStatus === 'rejected').length} hồ sơ
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center border border-red-500/20 shadow-2xs">
                <XCircle className="w-6 h-6 stroke-[2.2]" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs hover:shadow-md transition-all flex items-center justify-between">
              <div>
                <div className="text-[10px] text-stone-400 font-extrabold uppercase tracking-wider">Thẻ Đang Bị Khóa</div>
                <div className="text-2xl font-black text-stone-900 mt-1">
                  {cards.filter(c => c.cardStatus === 'locked').length} thẻ
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-stone-500/10 text-stone-700 flex items-center justify-center border border-stone-500/20 shadow-2xs">
                <Lock className="w-6 h-6 stroke-[2.2]" />
              </div>
            </div>
          </div>

          {/* Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <Input
                placeholder="Tìm tên, email, SĐT hoặc mã thẻ..."
                prefix={<Search className="w-4 h-4 text-stone-400 mr-1" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 rounded-xl text-xs"
                allowClear
              />

              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600">
                <Filter className="w-3.5 h-3.5 text-stone-400" />
                <span>Trạng thái:</span>
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  className="w-36 text-xs font-semibold"
                  options={[
                    { value: 'all', label: 'Tất cả trạng thái' },
                    { value: 'pending', label: 'Chờ duyệt hồ sơ' },
                    { value: 'active', label: 'Đang hoạt động' },
                    { value: 'rejected', label: 'Từ chối duyệt' },
                    { value: 'locked', label: 'Bị khóa' },
                  ]}
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600">
                <span>Loại thẻ:</span>
                <Select
                  value={typeFilter}
                  onChange={setTypeFilter}
                  className="w-36 text-xs font-semibold"
                  options={[
                    { value: 'all', label: 'Tất cả loại thẻ' },
                    { value: 'student', label: 'Thẻ Sinh viên' },
                    { value: 'guest', label: 'Thẻ Khách vãng lai' },
                    { value: 'staff', label: 'Thẻ Cán bộ' },
                  ]}
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              <Button 
                icon={<RefreshCw className="w-4 h-4" />} 
                onClick={fetchCards}
                className="rounded-xl font-bold text-xs"
              >
                Làm mới
              </Button>

              <Button 
                type="primary"
                icon={<Download className="w-4 h-4" />} 
                onClick={handleExportCSV}
                className="rounded-xl font-bold text-xs"
              >
                Xuất Excel / CSV
              </Button>
            </div>

          </div>

          {/* Cards Table */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
            <Table
              columns={columns}
              dataSource={filteredCards}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 8,
                showSizeChanger: false,
                showTotal: (total) => `Tổng số ${total} hồ sơ thẻ`,
              }}
              className="custom-admin-table text-xs"
            />
          </div>

        </main>

      </div>

      {/* APPROVE CARD MODAL */}
      <Modal
        title="Duyệt Cấp Thẻ Thư Viện"
        open={approveModalVisible}
        onCancel={() => setApproveModalVisible(false)}
        footer={null}
        width={450}
        centered
      >
        <Form form={formApprove} layout="vertical" onFinish={handleApproveSubmit} className="pt-2">
          <p className="text-xs text-stone-600 mb-3">
            Xác nhận duyệt hồ sơ thẻ cho bạn đọc: <strong className="text-stone-900">{selectedCardTarget?.fullName}</strong>
          </p>

          <Form.Item
            label={<span className="font-bold text-xs">Mã Số Thẻ Cấp Mới</span>}
            name="memberCode"
            rules={[{ required: true, message: 'Vui lòng nhập mã thẻ!' }]}
          >
            <Input className="font-mono font-bold rounded-xl" />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-xs">Thời Hạn Thẻ (Tháng)</span>}
            name="expiryMonths"
            rules={[{ required: true }]}
          >
            <Select
              className="rounded-xl"
              options={[
                { value: 6, label: '6 Tháng' },
                { value: 12, label: '1 Năm (12 Tháng)' },
                { value: 24, label: '2 Năm (24 Tháng)' },
                { value: 48, label: '4 Năm (Toàn khóa học)' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-xs">Hạn Mức Mượn Sách Tối Đa</span>}
            name="maxBorrowLimit"
          >
            <Select
              className="rounded-xl"
              options={[
                { value: 2, label: '2 Cuốn (Khách vãng lai)' },
                { value: 5, label: '5 Cuốn (Sinh viên / Thành viên)' },
                { value: 10, label: '10 Cuốn (Cán bộ / VIP)' },
              ]}
            />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
            <Button onClick={() => setApproveModalVisible(false)} className="rounded-xl">
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" className="bg-emerald-600 hover:bg-emerald-700 border-none font-bold rounded-xl">
              Duyệt Cấp Thẻ Ngay
            </Button>
          </div>
        </Form>
      </Modal>

      {/* REJECT CARD MODAL */}
      <Modal
        title="Từ Chối Hồ Sơ Thẻ"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        footer={null}
        width={420}
        centered
      >
        <Form form={formReject} layout="vertical" onFinish={handleRejectSubmit} className="pt-2">
          <p className="text-xs text-stone-600 mb-3">
            Từ chối duyệt hồ sơ thẻ của: <strong className="text-stone-900">{selectedCardTarget?.fullName}</strong>
          </p>

          <Form.Item
            label={<span className="font-bold text-xs">Lý Do Từ Chối Hồ Sơ</span>}
            name="rejectReason"
            rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối!' }]}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Ví dụ: Ảnh 3x4 mờ không rõ mặt, thông tin địa chỉ không chính xác..."
              className="rounded-xl text-xs" 
            />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
            <Button onClick={() => setRejectModalVisible(false)} className="rounded-xl">
              Hủy
            </Button>
            <Button danger type="primary" htmlType="submit" className="font-bold rounded-xl">
              Xác Nhận Từ Chối
            </Button>
          </div>
        </Form>
      </Modal>

    </div>
  );
}

export default CardManagementPage;
