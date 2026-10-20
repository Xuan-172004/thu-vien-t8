import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Tabs, Card, Space, Popconfirm, Empty, Badge } from 'antd';
import showToast from '../../utils/toast';
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Repeat, 
  Trash2, 
  RefreshCw, 
  Home, 
  FileText,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MainHeader from '../../components/MainHeader';
import TopHeader from '../../components/TopHeader';
import Footer from '../../components/Footer';
import { getMyRentalOrdersApi, requestExtensionApi, cancelBorrowOrderApi } from '../../api/rentalUser.api';
import { useAuth } from '../../context/AuthContext';

export function MyRentalsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const auth = useAuth() || {};
  const currentUser = auth.user;
  const navigate = useNavigate();

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const res = await getMyRentalOrdersApi({ userId: currentUser?.id, status: activeTab });
      const list = res.metadata || res.data || res || [];
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Fetch my orders error:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, [activeTab, currentUser]);

  const handleRequestExtension = async (orderId) => {
    try {
      const res = await requestExtensionApi(orderId);
      showToast.success(res.message || 'Đã gia hạn mượn sách thành công!');
      fetchMyOrders();
    } catch (err) {
      showToast.error(err.response?.data?.message || err.message || 'Lỗi khi yêu cầu gia hạn sách!');
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const res = await cancelBorrowOrderApi(orderId);
      showToast.success(res.message || 'Đã hủy phiếu mượn & hoàn tiền cọc vào ví!');
      fetchMyOrders();
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      showToast.error(err.response?.data?.message || err.message || 'Lỗi khi hủy phiếu mượn!');
    }
  };

  const isOverdueByDate = (ord) => {
    if (!ord?.dueDate) return false;
    if (!['Rented', 'Active', 'active'].includes(ord.status)) return false;
    return ord.dueDate < new Date().toISOString().slice(0, 10);
  };

  const getStatusTag = (ord) => {
    const status = isOverdueByDate(ord) ? 'Overdue' : ord.status;
    switch (status) {
      case 'Pending':
        return <Tag color="gold" className="font-bold text-xs">Chờ duyệt thủ thư</Tag>;
      case 'Approved':
        return <Tag color="blue" className="font-bold text-xs">Đã duyệt - Sẵn sàng lấy</Tag>;
      case 'Rented':
      case 'active':
        return <Tag color="emerald" className="font-bold text-xs">Đang mượn</Tag>;
      case 'Overdue':
        return <Tag color="red" className="font-bold text-xs">Quá hạn trả</Tag>;
      case 'Returned':
      case 'completed':
        return <Tag color="default" className="font-bold text-xs">Đã trả sách</Tag>;
      case 'Cancelled':
      case 'Rejected':
        return <Tag color="volcano" className="font-bold text-xs">Đã hủy / Từ chối</Tag>;
      default:
        return <Tag color="stone" className="font-bold text-xs">{status}</Tag>;
    }
  };

  const tabItems = [
    { key: 'all', label: 'Tất Cả Phiếu Mượn' },
    { key: 'Pending', label: 'Chờ Duyệt' },
    { key: 'Rented', label: 'Đang Mượn' },
    { key: 'Overdue', label: 'Quá Hạn' },
    { key: 'Returned', label: 'Lịch Sử Đã Trả' },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col font-sans">
      <TopHeader />
      <MainHeader />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 space-y-6">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <Button
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/')}
            className="rounded-xl font-bold text-xs border-stone-300"
          >
            Quay lại trang chủ
          </Button>

          <Button
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchMyOrders}
            className="rounded-xl font-bold text-xs"
          >
            Làm mới
          </Button>
        </div>

        {/* Page Banner */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-stone-900 text-white p-6 rounded-3xl shadow-md space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Sổ Mượn Sách Cá Nhân</span>
          </div>
          <h1 className="text-2xl font-black text-amber-100">Lịch Sử & Quản Lý Phiếu Mượn Sách</h1>
          <p className="text-xs text-amber-200/80 max-w-xl">
            Theo dõi trạng thái duyệt phiếu mượn online, hạn trả sách và gửi yêu cầu gia hạn trực tuyến.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-6">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="custom-inventory-tabs font-bold"
          />

          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((ord) => (
                <div key={ord.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
                  
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="font-mono font-black text-amber-900 text-sm bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                        {ord.orderCode}
                      </div>
                      {getStatusTag(ord)}
                      <Tag color="cyan" className="font-bold text-xs">
                        {ord.borrowType === 'home' ? 'Mượn về nhà' : 'Đọc tại chỗ'}
                      </Tag>
                    </div>

                    <div className="text-xs text-stone-500 font-semibold flex items-center gap-3">
                      <span>Hẹn lấy: <strong className="text-stone-900">{ord.pickupDate || 'Hôm nay'}</strong></span>
                      <span>Hạn trả: <strong className="text-amber-800">{ord.dueDate || '14 ngày'}</strong></span>
                      {(ord.status === 'Overdue' || isOverdueByDate(ord) || Number(ord.fineAmount) > 0) && (
                        <span>Phạt: <strong className="text-red-600">{Number(ord.fineAmount || 0).toLocaleString('vi-VN')} đ</strong></span>
                      )}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2">
                    {ord.items && ord.items.map((item, idx) => (
                      <div key={item.id || idx} className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-150">
                        {item.bookCover && (
                          <img src={item.bookCover} alt="Cover" className="w-10 h-14 rounded object-cover border border-stone-200 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-stone-900 text-xs line-clamp-1">{item.bookTitle}</h4>
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            Mã ĐKCB: <span className="font-mono text-amber-800 font-bold">{item.dkcbCode || 'Đang cập nhật'}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                    <span className="text-stone-500 font-medium">
                      Đã gia hạn: <strong className="text-stone-900">{ord.extensionsCount || 0}/2 lần</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      {ord.status === 'Pending' && (
                        <Popconfirm
                          title="Hủy yêu cầu mượn sách này?"
                          onConfirm={() => handleCancelOrder(ord.id)}
                          okText="Hủy Phiếu"
                          cancelText="Bỏ qua"
                          okButtonProps={{ danger: true }}
                        >
                          <Button danger size="small" icon={<Trash2 className="w-3.5 h-3.5" />} className="rounded-lg font-bold text-xs">
                            Hủy Yêu Cầu
                          </Button>
                        </Popconfirm>
                      )}

                      {(ord.status === 'Rented' || ord.status === 'Approved') && !isOverdueByDate(ord) && (
                        <Button
                          type="primary"
                          size="small"
                          icon={<Repeat className="w-3.5 h-3.5" />}
                          onClick={() => handleRequestExtension(ord.id)}
                          className="rounded-lg font-bold text-xs bg-amber-600 hover:bg-amber-700 border-none"
                        >
                          Yêu Cầu Gia Hạn (+7 ngày)
                        </Button>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="py-12">
              <Empty
                description={
                  <div className="space-y-1">
                    <p className="font-bold text-xs text-stone-700">Chưa có phiếu mượn sách nào!</p>
                    <p className="text-[11px] text-stone-400">Hãy tìm sách và chọn "Thêm vào giỏ mượn" để gửi yêu cầu mượn online.</p>
                  </div>
                }
              />
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default MyRentalsPage;
