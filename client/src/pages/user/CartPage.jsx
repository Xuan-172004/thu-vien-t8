import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Radio, 
  DatePicker, 
  Button, 
  Tag, 
  Breadcrumb, 
  Empty, 
  Alert,
  Popconfirm 
} from 'antd';
import showToast from '../../utils/toast';
import { 
  ShoppingBag, 
  BookOpen, 
  Home, 
  Calendar, 
  Clock, 
  Trash2, 
  ArrowLeft, 
  PackageCheck, 
  ShieldCheck, 
  Info,
  CheckCircle2,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import dayjs from 'dayjs';

import TopHeader from '../../components/TopHeader';
import MainHeader from '../../components/MainHeader';
import Footer from '../../components/Footer';
import { useRentalCart } from '../../context/rentalCartContext';
import { useAuth } from '../../context/AuthContext';
import { createBorrowOrderApi } from '../../api/rentalUser.api';
import { getAllPoliciesApi } from '../../api/rentalPolicyAdmin.api';

export function CartPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const auth = useAuth() || {};
  const currentUser = auth.user;
  const { cartItems, removeFromCart, clearCart } = useRentalCart();

  const handleFinish = async (values) => {
    if (cartItems.length === 0) {
      showToast.warning('Giỏ mượn sách đang trống!');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        userId: currentUser?.id || 'user-guest',
        customerName: values.customerName || currentUser?.fullName || 'Bạn đọc',
        phone: values.phone || currentUser?.phone || '0901234567',
        email: values.email || currentUser?.email || '',
        borrowType: values.borrowType || 'home',
        pickupDate: values.pickupDate ? values.pickupDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : dayjs().add(14, 'day').format('YYYY-MM-DD'),
        note: values.note || '',
        items: cartItems.map((b) => ({
          bookId: b.id,
          title: b.title,
          cover: b.cover || b.coverImage,
          deposit: b.depositPrice || b.deposit || 0,
        })),
      };

      const res = await createBorrowOrderApi(payload);
      showToast.success(res.message || 'Gửi yêu cầu mượn sách thành công! Đã trừ tiền cọc & phí mượn từ ví.');
      clearCart();
      setTimeout(() => {
        window.location.href = '/my-rentals';
      }, 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Lỗi khi gửi yêu cầu mượn sách';
      showToast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const [activePolicy, setActivePolicy] = useState(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const res = await getAllPoliciesApi();
        const policies = res?.metadata || res?.data || res || [];
        if (Array.isArray(policies) && policies.length > 0) {
          const userCardType = currentUser?.userType || 'student';
          const matched = policies.find((p) => p.cardType === userCardType) || policies[0];
          setActivePolicy(matched);

          if (matched) {
            if (matched.allowHomeBorrow === false && matched.allowRoomRead !== false) {
              form.setFieldsValue({ borrowType: 'room' });
            } else if (matched.allowRoomRead === false && matched.allowHomeBorrow !== false) {
              form.setFieldsValue({ borrowType: 'home' });
            }
          }
        }
      } catch (err) {
        console.warn('Fetch policy error:', err);
      }
    };
    fetchPolicy();
  }, [currentUser]);

  const watchedPickup = Form.useWatch('pickupDate', form) || dayjs();
  const watchedDue = Form.useWatch('dueDate', form) || dayjs().add(14, 'day');
  const borrowDays = Math.max(1, dayjs(watchedDue).diff(dayjs(watchedPickup), 'day'));

  const getDailyRateInfo = (days) => {
    const d = Math.max(1, Number(days) || 1);
    const t1 = Number(activePolicy?.dailyRateTier1) || 5000;
    const t2 = Number(activePolicy?.dailyRateTier2) || 3000;
    const t3 = Number(activePolicy?.dailyRateTier3) || 2000;
    const t4 = Number(activePolicy?.dailyRateTier4) || 1500;

    let rate = t1;
    let label = `${t1.toLocaleString()}đ/ngày (1-7 ngày)`;
    if (d >= 31) {
      rate = t4;
      label = `${t4.toLocaleString()}đ/ngày (Trên 30 ngày)`;
    } else if (d >= 15) {
      rate = t3;
      label = `${t3.toLocaleString()}đ/ngày (15-30 ngày)`;
    } else if (d >= 8) {
      rate = t2;
      label = `${t2.toLocaleString()}đ/ngày (8-14 ngày)`;
    }
    return { rate, label, d };
  };

  const getBookDeposit = (item) => {
    if (item.deposit !== undefined && item.deposit !== null) return Number(item.deposit);
    if (item.depositPrice !== undefined && item.depositPrice !== null) return Number(item.depositPrice);
    if (item.depositFee !== undefined && item.depositFee !== null) return Number(item.depositFee);
    return 50000;
  };

  const getBookRentalFee = (item, days = 14) => {
    const { rate, d } = getDailyRateInfo(days);
    return rate * d;
  };

  const currentRateInfo = getDailyRateInfo(borrowDays);
  const totalDeposit = cartItems.reduce((sum, item) => sum + getBookDeposit(item), 0);
  const totalRentalFee = cartItems.reduce((sum, item) => sum + getBookRentalFee(item, borrowDays), 0);
  const grandTotal = totalDeposit + totalRentalFee;

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col font-sans">
      <TopHeader />
      <MainHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 space-y-6">
        
        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between">
          <Breadcrumb
            items={[
              { title: <a onClick={() => navigate('/')}>Trang chủ</a> },
              { title: <span className="font-bold text-stone-900">Giỏ mượn sách chi tiết</span> },
            ]}
          />

          <Button
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/')}
            className="rounded-xl font-bold text-xs"
          >
            Tiếp tục tìm sách
          </Button>
        </div>

        {/* Page Banner */}
        <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-stone-900 text-white p-6 rounded-3xl shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
              <ShoppingBag className="w-4 h-4" />
              <span>Xác Nhận Mượn Sách Online</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-amber-100">Giỏ Mượn Sách & Đăng Ký Phiếu</h1>
          </div>
          <Tag color="amber" className="font-black text-xs px-3 py-1 rounded-xl">
            {cartItems.length}/5 Cuốn Sách
          </Tag>
        </div>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Cart Items List (7 cols) */}
            <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-6">
              
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="font-black text-stone-900 text-sm uppercase tracking-wide flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  <span>Danh Sách Đầu Sách Đã Chọn ({cartItems.length})</span>
                </h3>

                <Popconfirm
                  title="Xóa tất cả sách khỏi giỏ?"
                  onConfirm={clearCart}
                  okText="Xóa tất cả"
                  cancelText="Bỏ qua"
                  okButtonProps={{ danger: true }}
                >
                  <button type="button" className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa tất cả</span>
                  </button>
                </Popconfirm>
              </div>

              <div className="space-y-4">
                {cartItems.map((book, idx) => (
                  <div
                    key={book.id || idx}
                    className="bg-stone-50/80 p-4 rounded-2xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={book.cover || book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'}
                        alt={book.title}
                        className="w-14 h-20 rounded-xl object-cover border border-stone-200 shrink-0"
                      />
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Tag color="amber" className="font-black text-[10px] m-0"># {idx + 1}</Tag>
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                            {book.categoryName || 'Tủ sách'}
                          </span>
                        </div>
                        <h4 className="font-black text-stone-900 text-sm line-clamp-1">{book.title}</h4>
                        <p className="text-xs text-stone-500 font-medium">Tác giả: {book.author || 'Thư viện'}</p>
                        <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 pt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Sẵn sàng cho mượn tại kho
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-stone-200 pt-2 sm:pt-0 shrink-0 gap-1">
                      <div className="text-right text-xs">
                        <div className="text-stone-500 font-medium">
                          Cọc hoàn lại: <strong className="text-stone-900 font-bold">{getBookDeposit(book).toLocaleString()} đ</strong>
                        </div>
                        <div className="text-amber-800 font-medium mt-0.5">
                          Phí mượn ({borrowDays} ngày): <strong className="text-amber-600 font-extrabold">{getBookRentalFee(book, borrowDays).toLocaleString()} đ</strong>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(book.id)}
                        className="text-stone-400 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-stone-200/60 mt-1"
                        title="Bỏ sách khỏi giỏ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Policy alert info */}
              <Alert
                message={<span className="font-bold text-xs">Quy định hạn mức mượn sách</span>}
                description="Bạn đọc được mượn tối đa 5 cuốn cùng lúc. Thời hạn mượn chuẩn 14 ngày/lần. Tiền đặt cọc được hoàn trả 100% khi sách được trả về thư viện an toàn."
                type="info"
                showIcon
                className="rounded-2xl border-amber-200 bg-amber-50/60 text-xs"
              />

            </div>

            {/* Right Column: Checkout Configuration Form (5 cols) */}
            <div className="lg:col-span-5 bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-2xs space-y-6 sticky top-24">
              
              <div className="border-b border-stone-100 pb-3">
                <h3 className="font-black text-stone-900 text-sm uppercase tracking-wide flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-600" />
                  <span>Thông Tin Đặt Mượn Sách</span>
                </h3>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                initialValues={{
                  borrowType: 'home',
                  pickupDate: dayjs(),
                  dueDate: dayjs().add(14, 'day'),
                  customerName: currentUser?.fullName || currentUser?.name || '',
                  phone: currentUser?.phone || '',
                  email: currentUser?.email || '',
                }}
                className="space-y-4"
              >
                <Form.Item
                  label={<span className="font-bold text-xs text-stone-700">Hình Thức Mượn Sách</span>}
                  name="borrowType"
                  rules={[{ required: true, message: 'Chọn hình thức mượn!' }]}
                >
                  <Radio.Group className="grid grid-cols-2 gap-3 w-full">
                    <Radio.Button
                      value="home"
                      disabled={activePolicy && activePolicy.allowHomeBorrow === false}
                      className="rounded-xl font-bold text-xs h-11 flex items-center justify-center"
                    >
                      <div className="flex items-center gap-1.5">
                        <Home className="w-4 h-4 text-emerald-600" />
                        <span>Mượn Về Nhà</span>
                      </div>
                    </Radio.Button>
                    <Radio.Button
                      value="room"
                      disabled={activePolicy && activePolicy.allowRoomRead === false}
                      className="rounded-xl font-bold text-xs h-11 flex items-center justify-center"
                    >
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span>Đọc Tại Phòng</span>
                      </div>
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>

                {activePolicy && (activePolicy.allowHomeBorrow === false || activePolicy.allowRoomRead === false) && (
                  <div className="text-[11px] font-bold text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>{activePolicy.allowHomeBorrow === false ? 'Hình thức "Mượn Về Nhà"' : 'Hình thức "Đọc Tại Phòng"'} tạm thời không khả dụng theo quy định thẻ hiện tại.</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Form.Item
                    label={<span className="font-bold text-xs text-stone-700">Ngày Hẹn Lấy Sách</span>}
                    name="pickupDate"
                    rules={[{ required: true, message: 'Chọn ngày lấy!' }]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      format="DD/MM/YYYY"
                      disabledDate={(current) => current && current < dayjs().startOf('day')}
                      className="rounded-xl text-xs font-bold"
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span className="font-bold text-xs text-stone-700">Dự Kiến Hạn Trả Sách</span>}
                    name="dueDate"
                    rules={[{ required: true, message: 'Chọn ngày trả!' }]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      format="DD/MM/YYYY"
                      disabledDate={(current) => {
                        const pick = form.getFieldValue('pickupDate') || dayjs();
                        return current && current < pick.startOf('day');
                      }}
                      className="rounded-xl text-xs font-bold"
                    />
                  </Form.Item>
                </div>

                <Form.Item
                  label={<span className="font-bold text-xs text-stone-700">Họ và Tên Bạn Đọc</span>}
                  name="customerName"
                  rules={[{ required: true, message: 'Nhập họ tên!' }]}
                >
                  <Input placeholder="Nguyễn Văn A" className="rounded-xl text-xs font-bold" />
                </Form.Item>

                <div className="grid grid-cols-2 gap-3">
                  <Form.Item
                    label={<span className="font-bold text-xs text-stone-700">Số Điện Thoại</span>}
                    name="phone"
                    rules={[{ required: true, message: 'Nhập SĐT!' }]}
                  >
                    <Input placeholder="0901234567" className="rounded-xl text-xs font-bold" />
                  </Form.Item>

                  <Form.Item label={<span className="font-bold text-xs text-stone-700">Email</span>} name="email">
                    <Input placeholder="user@example.com" className="rounded-xl text-xs font-bold" />
                  </Form.Item>
                </div>

                <Form.Item label={<span className="font-bold text-xs text-stone-700">Ghi Chú Gửi Thủ Thư</span>} name="note">
                  <Input.TextArea rows={2} placeholder="Nhập ghi chú yêu cầu thêm..." className="rounded-xl text-xs" />
                </Form.Item>

                {/* Guest Warning if not logged in or guest */}
                {(!currentUser || currentUser?.role === 'guest') && (
                  <Alert
                    message="Yêu Cầu Tài Khoản / Thẻ Thư Viện"
                    description="Khách vãng lai chỉ có thể tra cứu sách và xem tài liệu số. Vui lòng đăng nhập hoặc đăng ký thẻ thư viện để gửi yêu cầu mượn sách in."
                    type="warning"
                    showIcon
                    action={
                      <Button type="primary" size="small" onClick={() => navigate('/auth')} className="bg-amber-600 font-bold rounded-lg text-xs">
                        Đăng Nhập Ngay
                      </Button>
                    }
                    className="rounded-2xl text-xs mb-4"
                  />
                )}

                {/* Summary Financial Box - Free Physical Borrowing */}
                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-stone-600 font-medium">
                    <span>Tổng số lượng sách:</span>
                    <strong className="text-stone-900 font-bold">{cartItems.length} cuốn</strong>
                  </div>

                  <div className="flex items-center justify-between text-stone-600 font-medium">
                    <span>Thời hạn mượn dự kiến:</span>
                    <strong className="text-stone-900 font-bold">{borrowDays} ngày</strong>
                  </div>

                  <div className="flex items-center justify-between text-stone-600 font-medium">
                    <span>Hình thức chi phí:</span>
                    <span className="text-emerald-800 font-extrabold bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                      Miễn Phí Cho Độc Giả
                    </span>
                  </div>

                  <div className="border-t border-emerald-200 pt-2 flex items-center justify-between font-black text-sm text-stone-900">
                    <span>Tổng chi phí mượn:</span>
                    <span className="text-xl text-emerald-700 font-black">0 VNĐ (Miễn Phí)</span>
                  </div>
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  disabled={!currentUser || currentUser?.role === 'guest'}
                  icon={<PackageCheck className="w-5 h-5" />}
                  className="rounded-2xl font-black bg-amber-600 hover:bg-amber-700 border-none w-full h-12 text-xs shadow-md"
                >
                  Xác Nhận Đặt Mượn Sách In
                </Button>
              </Form>

            </div>

          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-stone-200 shadow-2xs text-center py-16">
            <Empty
              description={
                <div className="space-y-2 mt-2">
                  <h3 className="font-black text-stone-900 text-base">Giỏ mượn sách của bạn đang trống!</h3>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    Vui lòng quay lại danh mục sách và chọn "Thêm vào giỏ mượn" để thực hiện đăng ký phiếu mượn online.
                  </p>
                </div>
              }
            />
            <Button
              type="primary"
              onClick={() => navigate('/')}
              icon={<BookOpen className="w-4 h-4" />}
              className="mt-6 rounded-2xl font-bold bg-amber-600 hover:bg-amber-700 border-none h-11 px-8 text-xs"
            >
              Khám Phá Danh Mục Sách
            </Button>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

export default CartPage;
