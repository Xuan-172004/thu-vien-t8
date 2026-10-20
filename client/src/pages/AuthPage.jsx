import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Tabs, Alert } from 'antd';
import { BookOpen, User, Lock, Mail, Phone, ShieldCheck, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AuthPage() {
  const navigate = useNavigate();
  const { login, register, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If already authenticated, redirect to home
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (values) => {
    setLoading(true);
    setErrorMessage('');
    const res = await login(values.email, values.password);
    setLoading(false);
    if (res.success) {
      navigate('/');
    } else {
      setErrorMessage(res.error || 'Đăng nhập không thành công.');
    }
  };

  const handleRegister = async (values) => {
    setLoading(true);
    setErrorMessage('');
    const res = await register(values.fullName, values.email, values.password, values.phone);
    setLoading(false);
    if (res.success) {
      navigate('/');
    } else {
      setErrorMessage(res.error || 'Đăng ký không thành công.');
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-amber-500 selection:text-white">
      
      {/* Top Header Back Button */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-amber-600 bg-white px-3.5 py-2 rounded-xl border border-stone-200 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay về trang chủ</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-lg font-black tracking-tight text-stone-900">
            Thư Viện<span className="text-amber-600"> Sách</span>
          </span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1 my-auto">
        
        {/* Left Column: Brand Highlights & Features */}
        <div className="lg:col-span-5 space-y-6 hidden lg:block pr-4">
          <div className="inline-flex items-center gap-2 bg-amber-100/80 border border-amber-200 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nền tảng đọc sách thông minh</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-black text-stone-900 tracking-tight leading-tight">
            Đọc hàng ngàn sách hay với giá thuê chỉ từ <span className="text-amber-600">2.000đ/ngày</span>
          </h1>

          <p className="text-stone-600 text-sm leading-relaxed">
            Tham gia cộng đồng hàng chục ngàn mọt sách. Mượn sách dễ dàng, giao tận nơi trong 2h, hoàn 100% tiền cọc khi trả sách.
          </p>

          {/* Benefits list */}
          <div className="space-y-3 pt-2">
            {[
              'Miễn phí 100% tiền đặt cọc cho hội viên',
              'Giao & nhận lại sách tận nhà tiện lợi',
              'Đổi sách đọc không giới hạn mỗi tháng',
              'Sách đẹp, đóng gói cẩn thận, chuẩn NXB',
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs font-semibold text-stone-700">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-stone-200 text-xs text-stone-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Bảo mật thông tin & thanh toán an toàn 100%</span>
          </div>
        </div>

        {/* Right Column: Interactive Auth Card */}
        <div className="lg:col-span-7 w-full max-w-md mx-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl shadow-amber-500/5 relative overflow-hidden">
            
            {/* Top Warm Bar Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

            {/* Title & Tabs */}
            <div className="text-center mb-6 pt-2">
              <h2 className="text-2xl font-black text-stone-900">
                {activeTab === 'login' ? 'Đăng Nhập Tài Khoản' : 'Tạo Tài Khoản Mới'}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {activeTab === 'login' 
                  ? 'Vui lòng nhập thông tin để truy cập kho sách của bạn' 
                  : 'Đăng ký nhanh chỉ trong 30 giây để bắt đầu thuê sách'}
              </p>
            </div>

            {/* Tab Toggle */}
            <div className="mb-6 bg-stone-100 p-1 rounded-xl">
              <Tabs
                activeKey={activeTab}
                onChange={(key) => { setActiveTab(key); setErrorMessage(''); }}
                centered
                className="custom-auth-tabs"
                items={[
                  { key: 'login', label: <span className="font-bold text-xs sm:text-sm px-4">Đăng Nhập</span> },
                  { key: 'register', label: <span className="font-bold text-xs sm:text-sm px-4">Đăng Ký</span> },
                ]}
              />
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <Alert 
                message={errorMessage} 
                type="error" 
                showIcon 
                closable 
                className="mb-4 text-xs font-semibold"
                onClose={() => setErrorMessage('')}
              />
            )}

            {/* LOGIN FORM */}
            {activeTab === 'login' && (
              <Form layout="vertical" onFinish={handleLogin} className="space-y-4">
                <Form.Item
                  label={<span className="font-bold text-xs text-stone-700">Địa chỉ Email</span>}
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập địa chỉ Email!' },
                    { type: 'email', message: 'Email không hợp lệ!' }
                  ]}
                >
                  <Input 
                    prefix={<Mail className="w-4 h-4 text-stone-400 mr-1" />} 
                    placeholder="vi-du@email.com" 
                    size="large"
                    className="rounded-xl text-xs"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="font-bold text-xs text-stone-700">Mật khẩu</span>}
                  name="password"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                >
                  <Input.Password 
                    prefix={<Lock className="w-4 h-4 text-stone-400 mr-1" />} 
                    placeholder="••••••••" 
                    size="large"
                    className="rounded-xl text-xs"
                  />
                </Form.Item>

                <div className="flex items-center justify-between text-xs pb-1">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox className="text-stone-600 font-medium">Ghi nhớ đăng nhập</Checkbox>
                  </Form.Item>
                  <Link 
                    to="/forgot-password" 
                    className="text-amber-600 hover:text-amber-700 font-bold"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  className="font-bold h-12 text-sm rounded-xl"
                >
                  Đăng Nhập Ngay
                </Button>
              </Form>
            )}

            {/* REGISTER FORM */}
            {activeTab === 'register' && (
              <Form layout="vertical" onFinish={handleRegister} className="space-y-3">
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

                <Form.Item
                  label={<span className="font-bold text-xs text-stone-700">Địa chỉ Email</span>}
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập địa chỉ Email!' },
                    { type: 'email', message: 'Email không hợp lệ!' }
                  ]}
                >
                  <Input 
                    prefix={<Mail className="w-4 h-4 text-stone-400 mr-1" />} 
                    placeholder="vi-du@email.com" 
                    size="large"
                    className="rounded-xl text-xs"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="font-bold text-xs text-stone-700">Số Điện Thoại (Tùy chọn)</span>}
                  name="phone"
                >
                  <Input 
                    prefix={<Phone className="w-4 h-4 text-stone-400 mr-1" />} 
                    placeholder="0987 654 321" 
                    size="large"
                    className="rounded-xl text-xs"
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="font-bold text-xs text-stone-700">Mật khẩu</span>}
                  name="password"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu!' },
                    { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên!' }
                  ]}
                >
                  <Input.Password 
                    prefix={<Lock className="w-4 h-4 text-stone-400 mr-1" />} 
                    placeholder="Tối thiểu 6 ký tự" 
                    size="large"
                    className="rounded-xl text-xs"
                  />
                </Form.Item>

                <Form.Item
                  name="agree"
                  valuePropName="checked"
                  rules={[
                    { 
                      validator: (_, value) => 
                        value ? Promise.resolve() : Promise.reject(new Error('Vui lòng đồng ý với điều khoản dịch vụ!')) 
                    }
                  ]}
                >
                  <Checkbox className="text-xs text-stone-600">
                    Tôi đồng ý với <a href="#terms" className="text-amber-600 font-bold">Điều khoản & Chính sách</a> thuê sách.
                  </Checkbox>
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  className="font-bold h-12 text-sm rounded-xl"
                >
                  Tạo Tài Khoản Mới
                </Button>
              </Form>
            )}

            {/* Switch Tab Footer */}
            <div className="text-center mt-5 pt-3 border-t border-stone-100 text-xs text-stone-500">
              {activeTab === 'login' ? (
                <p>
                  Chưa có tài khoản?{' '}
                  <button 
                    onClick={() => { setActiveTab('register'); setErrorMessage(''); }} 
                    className="text-amber-600 font-extrabold hover:underline cursor-pointer"
                  >
                    Đăng ký ngay
                  </button>
                </p>
              ) : (
                <p>
                  Đã có tài khoản?{' '}
                  <button 
                    onClick={() => { setActiveTab('login'); setErrorMessage(''); }} 
                    className="text-amber-600 font-extrabold hover:underline cursor-pointer"
                  >
                    Đăng nhập
                  </button>
                </p>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Simple Footer */}
      <div className="text-center text-xs text-stone-400 py-4 mt-6">
        © 2026 ThuêSách247. Nền tảng cho thuê sách hàng đầu Việt Nam.
      </div>

    </div>
  );
}

export default AuthPage;
