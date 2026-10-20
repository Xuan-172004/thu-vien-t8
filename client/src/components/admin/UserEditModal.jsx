import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import { User, Mail, Phone, Lock, ShieldCheck, UserCheck } from 'lucide-react';

export default function UserEditModal({ visible, user, onClose, onSave }) {
  const [form] = Form.useForm();
  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || 'user',
        userType: user.userType || 'student',
        status: user.status || 'active',
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        role: 'user',
        userType: 'student',
        status: 'active',
      });
    }
  }, [user, visible, form]);

  const handleSubmit = async (values) => {
    try {
      await onSave(values, isEditing ? user.id : null);
      form.resetFields();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 font-black text-stone-900 text-base">
          <UserCheck className="w-5 h-5 text-amber-600" />
          <span>{isEditing ? 'Chỉnh Sửa Người Dùng' : 'Thêm Người Dùng Mới'}</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={520}
      centered
      className="user-edit-modal font-sans"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="pt-2 space-y-3"
      >
        <Form.Item
          label={<span className="font-bold text-xs text-stone-700">Họ và Tên</span>}
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
              placeholder="user@thuesach.vn" 
              size="large"
              className="rounded-xl text-xs"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-xs text-stone-700">Số Điện Thoại</span>}
            name="phone"
          >
            <Input 
              prefix={<Phone className="w-4 h-4 text-stone-400 mr-1" />}
              placeholder="0987654321" 
              size="large"
              className="rounded-xl text-xs"
            />
          </Form.Item>
        </div>

        {!isEditing && (
          <Form.Item
            label={<span className="font-bold text-xs text-stone-700">Mật khẩu</span>}
            name="password"
            rules={[
              { required: !isEditing, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Tối thiểu 6 ký tự' }
            ]}
          >
            <Input.Password 
              prefix={<Lock className="w-4 h-4 text-stone-400 mr-1" />}
              placeholder="••••••••" 
              size="large"
              className="rounded-xl text-xs"
            />
          </Form.Item>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Form.Item
            label={<span className="font-bold text-xs text-stone-700">Vai Trò (Role)</span>}
            name="role"
            rules={[{ required: true }]}
          >
            <Select 
              size="large"
              className="rounded-xl text-xs"
              options={[
                { value: 'user', label: 'User (Bạn đọc)' },
                { value: 'librarian', label: 'Librarian (Thủ thư)' },
                { value: 'admin', label: 'Admin (Quản trị)' },
                { value: 'superadmin', label: 'Superadmin' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-xs text-stone-700">Loại Độc Giả</span>}
            name="userType"
          >
            <Select 
              size="large"
              className="rounded-xl text-xs"
              options={[
                { value: 'student', label: 'Sinh viên / Thành viên' },
                { value: 'guest', label: 'Khách vãng lai' },
                { value: 'staff', label: 'Cán bộ / Giảng viên' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-xs text-stone-700">Trạng Thái</span>}
            name="status"
          >
            <Select 
              size="large"
              className="rounded-xl text-xs"
              options={[
                { value: 'active', label: 'Đang hoạt động' },
                { value: 'locked', label: 'Đã bị khóa' },
              ]}
            />
          </Form.Item>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
          <Button onClick={onClose} className="rounded-xl font-bold">
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" className="rounded-xl font-bold">
            {isEditing ? 'Cập Nhật Thông Tin' : 'Tạo Người Dùng Mới'}
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
