import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Upload, message, Radio, Tabs, Spin } from 'antd';
import { CreditCard, User, Mail, Phone, MapPin, Camera, UploadCloud, CheckCircle2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadCardAvatarApi } from '../../api/card.api';

export default function CardRegisterModal({ visible, onClose, onSubmit, initialValues }) {
  const [form] = Form.useForm();
  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (visible) {
      const defaultAvatar = initialValues?.avatar || '';
      form.setFieldsValue({
        userType: initialValues?.userType || 'student',
        fullName: initialValues?.fullName || '',
        email: initialValues?.email || '',
        phone: initialValues?.phone || '',
        address: initialValues?.address || '',
        avatar: defaultAvatar,
      });
      setAvatarPreview(defaultAvatar);
    }
  }, [visible, initialValues, form]);

  // Handle local image file upload directly to server via Multer
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn file hình ảnh (JPG, PNG, WEBP)!');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      message.error('Dung lượng ảnh tối đa là 10MB!');
      return;
    }

    setUploading(true);
    try {
      const res = await uploadCardAvatarApi(file);
      const serverUrl = res.metadata?.url || res.data?.url || res.url;
      if (serverUrl) {
        setAvatarPreview(serverUrl);
        form.setFieldsValue({ avatar: serverUrl });
        message.success('Đã tải ảnh 3x4 lên máy chủ thành công!');
      } else {
        throw new Error('Không nhận được đường dẫn ảnh từ máy chủ');
      }
    } catch (err) {
      console.error('Upload avatar error:', err);
      message.error(err.response?.data?.message || err.message || 'Lỗi khi tải ảnh lên máy chủ!');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (values) => {
    if (!values.avatar) {
      message.error('Vui lòng tải ảnh 3x4 từ máy tính hoặc dán link ảnh!');
      return;
    }
    try {
      await onSubmit(values);
      form.resetFields();
      setAvatarPreview('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 font-black text-stone-900 text-base">
          <CreditCard className="w-5 h-5 text-amber-600" />
          <span>Đăng Ký Thẻ Thư Viện Trực Tuyến</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={540}
      centered
      className="card-register-modal font-sans"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="pt-2 space-y-3"
      >
        {/* Auto-Assigned Card Type Banner based on User Account */}
        <Form.Item
          shouldUpdate={(prevValues, currentValues) => prevValues.userType !== currentValues.userType}
          noStyle
        >
          {({ getFieldValue }) => {
            const currentUserType = getFieldValue('userType') || 'student';
            const cardTypeInfo = {
              student: {
                title: 'Thẻ Sinh Viên / Thành Viên',
                badge: 'Tự động định danh Sinh viên',
                desc: 'Mượn tối đa 5 cuốn sách cùng lúc • Miễn 100% tiền đặt cọc',
                bg: 'bg-amber-50 border-amber-200 text-amber-900',
                badgeBg: 'bg-amber-200 text-amber-900',
              },
              guest: {
                title: 'Thẻ Khách Vãng Lai',
                badge: 'Bạn đọc tự do',
                desc: 'Mượn tối đa 2 cuốn sách cùng lúc • Đặt cọc 50% giá trị sách',
                bg: 'bg-stone-100 border-stone-300 text-stone-900',
                badgeBg: 'bg-stone-200 text-stone-800',
              },
              staff: {
                title: 'Thẻ Cán Bộ / Giảng Viên',
                badge: 'Tài khoản Cán bộ',
                desc: 'Mượn tối đa 10 cuốn sách cùng lúc • Ưu tiên mượn tài liệu đặc biệt',
                bg: 'bg-emerald-50 border-emerald-200 text-emerald-950',
                badgeBg: 'bg-emerald-200 text-emerald-900',
              },
            };

            const info = cardTypeInfo[currentUserType] || cardTypeInfo.student;

            return (
              <div className={`p-3.5 rounded-2xl border ${info.bg} flex items-center justify-between gap-3 shadow-2xs`}>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-extrabold text-xs">{info.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${info.badgeBg}`}>
                      {info.badge}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-80 font-medium leading-snug">
                    {info.desc}
                  </p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0" />
              </div>
            );
          }}
        </Form.Item>
        <Form.Item name="userType" noStyle>
          <Input type="hidden" />
        </Form.Item>

        <Form.Item
          label={<span className="font-bold text-xs text-stone-700">Họ và Tên Chủ Thẻ</span>}
          name="fullName"
          rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
        >
          <Input 
            prefix={<User className="w-4 h-4 text-stone-400 mr-1" />}
            placeholder="Nguyễn Văn A" 
            size="large"
            className="rounded-xl text-xs"
          />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item
            label={<span className="font-bold text-xs text-stone-700">Địa chỉ Email</span>}
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input 
              prefix={<Mail className="w-4 h-4 text-stone-400 mr-1" />}
              placeholder="email@thuesach.vn" 
              size="large"
              className="rounded-xl text-xs"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-xs text-stone-700">Số Điện Thoại</span>}
            name="phone"
            rules={[{ required: true, message: 'Vui lòng nhập SĐT!' }]}
          >
            <Input 
              prefix={<Phone className="w-4 h-4 text-stone-400 mr-1" />}
              placeholder="0987654321" 
              size="large"
              className="rounded-xl text-xs"
            />
          </Form.Item>
        </div>

        <Form.Item
          label={<span className="font-bold text-xs text-stone-700">Địa chỉ Nhận Thẻ / Giao Sách</span>}
          name="address"
          rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
        >
          <Input 
            prefix={<MapPin className="w-4 h-4 text-stone-400 mr-1" />}
            placeholder="Số nhà, đường, quận/huyện, thành phố" 
            size="large"
            className="rounded-xl text-xs"
          />
        </Form.Item>

        {/* 3x4 PORTRAIT UPLOAD COMPONENT */}
        <div className="space-y-1">
          <label className="font-bold text-xs text-stone-700 block">
            Ảnh Chân Dung 3x4 (Tải từ máy tính) <span className="text-red-500">*</span>
          </label>
          
          <div className="flex items-center gap-4 bg-stone-50 p-3 rounded-2xl border border-stone-200">
            {/* 3x4 Live Preview Frame */}
            <div className="w-20 h-28 rounded-xl bg-stone-200 border-2 border-dashed border-amber-400 overflow-hidden shrink-0 flex flex-col items-center justify-center relative shadow-sm">
              {uploading ? (
                <div className="flex flex-col items-center justify-center gap-1 text-amber-700">
                  <Spin size="small" />
                  <span className="text-[9px] font-bold">Đang tải...</span>
                </div>
              ) : avatarPreview ? (
                <img src={avatarPreview} alt="3x4 Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-2 text-stone-400">
                  <Camera className="w-6 h-6 mx-auto mb-1" />
                  <span className="text-[10px] font-bold">Khung 3x4</span>
                </div>
              )}
            </div>

            {/* Upload Buttons & File Selector */}
            <div className="flex-1 space-y-2">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                  id="avatar-file-input"
                />
                <label
                  htmlFor="avatar-file-input"
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-sm transition-colors ${
                    uploading ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  <UploadCloud className="w-4 h-4 stroke-[2.2]" />
                  <span>{uploading ? 'Đang tải lên máy chủ...' : 'Chọn ảnh từ máy tính...'}</span>
                </label>
              </div>

              <div className="text-[11px] text-stone-500 leading-snug">
                Chấp nhận file JPG, PNG, WEBP (tối đa 10MB). Ảnh chân dung rõ mặt, phông nền đơn sắc. Lưu trữ trực tiếp trên Server.
              </div>

              {/* Hidden Form Field storing base64/URL */}
              <Form.Item name="avatar" noStyle rules={[{ required: true, message: 'Vui lòng chọn ảnh 3x4!' }]}>
                <Input type="hidden" />
              </Form.Item>
            </div>
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-stone-100">
          <Button onClick={onClose} className="rounded-xl font-bold">
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" className="rounded-xl font-bold h-10 px-5">
            Gửi Hồ Sơ Đăng Ký Thẻ
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
