import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Alert, message } from 'antd';
import { BookOpen, Mail, Lock, KeyRound, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { forgotPasswordApi, resetPasswordApi } from '../api/auth.api';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Step 1: Send OTP to email
  const handleSendOtp = async (values) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await forgotPasswordApi(values.email);
      setEmail(values.email);
      setStep(2);
      message.success(res.message || 'Mã OTP đã được gửi đến email của bạn!');
    } catch (err) {
      setErrorMessage(err.message || 'Email chưa được đăng ký trong hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Reset Password
  const handleResetPassword = async (values) => {
    setLoading(true);
    setErrorMessage('');
    try {
      await resetPasswordApi({
        email,
        otp: values.otp,
        newPassword: values.newPassword,
      });
      message.success('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.');
      navigate('/auth');
    } catch (err) {
      setErrorMessage(err.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-amber-500 selection:text-white">
      
      {/* Top Navigation */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between mb-6">
        <Link 
          to="/auth" 
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-amber-600 bg-white px-3.5 py-2 rounded-xl border border-stone-200 shadow-2xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang Đăng nhập</span>
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

      {/* Main Card */}
      <div className="max-w-md w-full mx-auto my-auto">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl shadow-amber-500/5 relative overflow-hidden">
          
          {/* Top Bar Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

          {/* Icon Header */}
          <div className="text-center pt-2 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3 border border-amber-200 shadow-inner">
              <KeyRound className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h2 className="text-2xl font-black text-stone-900">
              {step === 1 ? 'Khôi Phục Mật Khẩu' : 'Nhập Mã OTP & Mật Khẩu Mới'}
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {step === 1 
                ? 'Nhập địa chỉ email đăng ký để nhận mã xác thực OTP' 
                : `Mã OTP đã được gửi đến địa chỉ email: ${email}`}
            </p>
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

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <Form layout="vertical" onFinish={handleSendOtp} className="space-y-4">
              <Form.Item
                label={<span className="font-bold text-xs text-stone-700">Địa chỉ Email đăng ký</span>}
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

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                className="font-bold h-12 text-sm rounded-xl"
              >
                Gửi Mã Xác Thực OTP
              </Button>
            </Form>
          )}

          {/* STEP 2: Enter OTP & Reset Password */}
          {step === 2 && (
            <Form layout="vertical" onFinish={handleResetPassword} className="space-y-4">
              <Form.Item
                label={<span className="font-bold text-xs text-stone-700">Mã OTP (6 chữ số)</span>}
                name="otp"
                rules={[{ required: true, message: 'Vui lòng nhập mã OTP!' }]}
              >
                <Input 
                  placeholder="Nhập 6 số OTP (Ví dụ: 123456)" 
                  size="large"
                  className="rounded-xl text-center font-bold tracking-widest text-lg"
                />
              </Form.Item>

              <Form.Item
                label={<span className="font-bold text-xs text-stone-700">Mật khẩu mới</span>}
                name="newPassword"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                  { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự!' }
                ]}
              >
                <Input.Password 
                  prefix={<Lock className="w-4 h-4 text-stone-400 mr-1" />} 
                  placeholder="••••••••" 
                  size="large"
                  className="rounded-xl text-xs"
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                className="font-bold h-12 text-sm rounded-xl"
              >
                Xác Nhận Đặt Lại Mật Khẩu
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-amber-600 font-bold hover:underline cursor-pointer"
                >
                  ← Nhập lại email khác
                </button>
              </div>
            </Form>
          )}

          {/* Bottom Security Note */}
          <div className="pt-4 mt-6 border-t border-stone-100 text-center text-xs text-stone-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Mã OTP có hiệu lực trong vòng 15 phút</span>
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

export default ForgotPasswordPage;
