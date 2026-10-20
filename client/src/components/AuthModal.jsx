import React, { useState } from 'react';
import { Modal, Form, Input, Button, Tabs, message } from 'antd';
import { User, Lock, Mail, Phone, BookOpen } from 'lucide-react';

export default function AuthModal({ visible, onClose }) {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);

  const handleFinish = (values) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success(activeTab === 'login' ? 'Đăng nhập thành công!' : 'Đăng ký tài khoản thành công!');
      onClose();
    }, 800);
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={420}
      centered
      className="auth-modal"
    >
      <div className="text-center pt-2 pb-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-amber-500/20">
          <BookOpen className="w-7 h-7 stroke-[2.2]" />
        </div>
        <h3 className="text-xl font-extrabold text-stone-900">
          Chào mừng đến với Thư Viện Sách
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          Hệ thống mượn sách & tra cứu tài liệu số thông minh
        </p>
      </div>

      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        centered
        items={[
          { key: 'login', label: 'Đăng Nhập' },
          { key: 'register', label: 'Đăng Ký Tài Khoản' },
        ]}
      />

      <Form layout="vertical" onFinish={handleFinish} className="mt-4 space-y-3">
        {activeTab === 'register' && (
          <Form.Item 
            name="fullname" 
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input prefix={<User className="w-4 h-4 text-stone-400" />} placeholder="Họ và tên người dùng" />
          </Form.Item>
        )}

        <Form.Item 
          name="email" 
          rules={[{ required: true, message: 'Vui lòng nhập Email hoặc Số điện thoại' }]}
        >
          <Input prefix={<Mail className="w-4 h-4 text-stone-400" />} placeholder="Email hoặc Số điện thoại" />
        </Form.Item>

        <Form.Item 
          name="password" 
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
        >
          <Input.Password prefix={<Lock className="w-4 h-4 text-stone-400" />} placeholder="Mật khẩu" />
        </Form.Item>

        <Button 
          type="primary" 
          htmlType="submit" 
          block 
          loading={loading}
          size="large"
          className="font-bold h-11 text-sm mt-2"
        >
          {activeTab === 'login' ? 'Đăng Nhập Ngay' : 'Tạo Tài Khoản Mới'}
        </Button>
      </Form>
    </Modal>
  );
}
