import React, { useState } from 'react';
import { Modal, Form, Input, Radio, DatePicker, Button, message, Alert, Tag } from 'antd';
import { BookOpen, Calendar, Clock, Home, PackageCheck, ShieldAlert, Sparkles, User } from 'lucide-react';
import dayjs from 'dayjs';
import { createBorrowOrderApi } from '../../api/rentalUser.api';
import { useAuth } from '../../context/AuthContext';

export default function BorrowBookModal({ visible, items = [], onClose, onSuccess }) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const auth = useAuth() || {};
  const currentUser = auth.user;

  const handleFinish = async (values) => {
    if (items.length === 0) {
      message.warning('Không có sách nào được chọn!');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        userId: currentUser?.id || 'user-guest',
        customerName: values.customerName || currentUser?.name || 'Bạn đọc',
        phone: values.phone || currentUser?.phone || '0900000000',
        email: values.email || currentUser?.email || '',
        borrowType: values.borrowType || 'home',
        pickupDate: values.pickupDate ? values.pickupDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : dayjs().add(14, 'day').format('YYYY-MM-DD'),
        note: values.note || '',
        items: items.map((b) => ({
          bookId: b.id,
          title: b.title,
          cover: b.cover || b.coverImage,
          deposit: b.deposit || 0,
        })),
      };

      const res = await createBorrowOrderApi(payload);
      message.success(res.message || 'Gửi yêu cầu mượn sách thành công!');
      form.resetFields();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Lỗi khi gửi yêu cầu mượn sách';
      message.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 font-black text-stone-900 text-base">
          <BookOpen className="w-5 h-5 text-amber-600" />
          <span>Đăng Ký Đặt Mượn Sách Online</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={560}
      centered
      className="font-sans"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          borrowType: 'home',
          pickupDate: dayjs(),
          dueDate: dayjs().add(14, 'day'),
          customerName: currentUser?.name || '',
          phone: currentUser?.phone || '',
          email: currentUser?.email || '',
        }}
        className="pt-2 space-y-4"
      >
        <Alert
          message={
            <span className="font-bold text-xs">
              Đang đặt mượn {items.length} đầu sách (Thời hạn chuẩn: 14 ngày)
            </span>
          }
          description="Yêu cầu mượn của bạn sẽ được gửi tới Thủ thư phê duyệt. Bạn sẽ nhận được thông báo khi sách sẵn sàng lấy."
          type="info"
          showIcon
          className="rounded-2xl border-amber-200 bg-amber-50/70 text-xs"
        />

        {/* Selected Books Summary */}
        <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 max-h-36 overflow-y-auto space-y-2">
          {items.map((b, idx) => (
            <div key={b.id || idx} className="flex items-center justify-between text-xs font-bold text-stone-800 bg-white p-2 rounded-xl border border-stone-200 shadow-2xs">
              <div className="flex items-center gap-2 line-clamp-1">
                <Tag color="amber" className="font-black text-[10px] m-0">{idx + 1}</Tag>
                <span className="line-clamp-1">{b.title}</span>
              </div>
              <span className="text-amber-800 text-[11px] font-mono shrink-0">Bản mượn</span>
            </div>
          ))}
        </div>

        {/* Form Fields */}
        <Form.Item
          label={<span className="font-bold text-xs text-stone-700">Hình Thức Mượn Sách</span>}
          name="borrowType"
          rules={[{ required: true }]}
        >
          <Radio.Group className="grid grid-cols-2 gap-3 w-full">
            <Radio.Button value="home" className="rounded-xl font-bold text-xs h-11 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-emerald-600" />
                <span>Mượn Về Nhà</span>
              </div>
            </Radio.Button>
            <Radio.Button value="room" className="rounded-xl font-bold text-xs h-11 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Đọc Tại Phòng</span>
              </div>
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

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

        <div className="grid grid-cols-2 gap-3">
          <Form.Item
            label={<span className="font-bold text-xs text-stone-700">Họ và Tên Bạn Đọc</span>}
            name="customerName"
            rules={[{ required: true, message: 'Nhập họ tên!' }]}
          >
            <Input placeholder="Nguyễn Văn A" className="rounded-xl text-xs font-bold" />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-xs text-stone-700">Số Điện Thoại Liên Hệ</span>}
            name="phone"
            rules={[{ required: true, message: 'Nhập SĐT!' }]}
          >
            <Input placeholder="0901234567" className="rounded-xl text-xs font-bold" />
          </Form.Item>
        </div>

        <Form.Item label={<span className="font-bold text-xs text-stone-700">Ghi Chú Gửi Thủ Thư</span>} name="note">
          <Input.TextArea rows={2} placeholder="Nhập yêu cầu thêm nếu có..." className="rounded-xl text-xs" />
        </Form.Item>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
          <Button onClick={onClose} className="rounded-xl font-bold">
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            icon={<PackageCheck className="w-4 h-4" />}
            className="rounded-xl font-bold bg-amber-600 hover:bg-amber-700 border-none h-10 px-6"
          >
            Gửi Yêu Cầu Đặt Mượn
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
