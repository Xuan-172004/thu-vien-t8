import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Result, Card, Tag } from 'antd';
import { CheckCircle2, XCircle, ArrowRight, BookOpen, Home, Wallet, ShieldCheck } from 'lucide-react';
import TopHeader from '../../components/TopHeader';
import MainHeader from '../../components/MainHeader';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';

export function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auth = useAuth() || {};
  const { user } = auth;

  const status = searchParams.get('status') || 'success';
  const amount = searchParams.get('amount') || 0;
  const txnRef = searchParams.get('txnRef') || 'DEP-UNKNOWN';
  const method = searchParams.get('method') || 'vnpay';

  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
      <TopHeader />
      <MainHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 md:px-8 py-12 flex flex-col items-center justify-center">
        <div className="w-full bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden text-center">
          
          {/* Header Banner */}
          <div className={`p-8 ${isSuccess ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700' : 'bg-gradient-to-r from-red-600 to-rose-700'} text-white relative overflow-hidden`}>
            <div className="relative z-10 space-y-3">
              <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto shadow-2xl">
                {isSuccess ? (
                  <CheckCircle2 className="w-12 h-12 text-white stroke-[2.2]" />
                ) : (
                  <XCircle className="w-12 h-12 text-white stroke-[2.2]" />
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                {isSuccess ? 'Nạp Tiền Ví Cọc Thành Công!' : 'Giao Dịch Nạp Tiền Thất Bại'}
              </h1>
              <p className="text-xs md:text-sm text-white/80 max-w-md mx-auto font-medium">
                {isSuccess
                  ? 'Số tiền nạp đã được tự động cộng vào Ví tiền cọc của bạn. Bạn có thể bắt đầu mượn sách ngay bây giờ!'
                  : 'Giao dịch không thành công hoặc bị hủy giữa chừng. Số dư của bạn chưa bị trừ.'}
              </p>
            </div>
          </div>

          {/* Details Card */}
          <div className="p-6 md:p-8 space-y-6">
            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-3 text-left">
              <h3 className="font-extrabold text-xs uppercase tracking-wider text-stone-400 border-b border-stone-200 pb-2">
                Chi Tiết Giao Dịch Nạp Ví
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs md:text-sm">
                <div>
                  <span className="text-stone-400 font-medium block">Mã Giao Dịch:</span>
                  <span className="font-black text-stone-800 font-mono">{txnRef}</span>
                </div>

                <div>
                  <span className="text-stone-400 font-medium block">Cổng Thanh Toán:</span>
                  <Tag color={method === 'momo' ? 'magenta' : 'blue'} className="font-bold text-xs uppercase rounded-md">
                    {method === 'momo' ? 'Ví MoMo App' : 'VNPAY QR / ATM'}
                  </Tag>
                </div>

                <div>
                  <span className="text-stone-400 font-medium block">Số Tiền Nạp:</span>
                  <span className="font-black text-emerald-600 text-base md:text-lg">
                    +{Number(amount).toLocaleString()} VNĐ
                  </span>
                </div>

                <div>
                  <span className="text-stone-400 font-medium block">Trạng Thái:</span>
                  <Tag color={isSuccess ? 'success' : 'error'} className="font-bold text-xs rounded-md">
                    {isSuccess ? 'Thành Công' : 'Thất Bại / Hủy'}
                  </Tag>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                size="large"
                onClick={() => navigate('/')}
                icon={<Home className="w-4 h-4" />}
                className="w-full sm:w-auto rounded-xl font-bold border-stone-300 text-stone-700 h-12 px-6 text-xs"
              >
                Về Trang Chủ
              </Button>

              <Button
                size="large"
                type="primary"
                onClick={() => navigate('/my-rentals')}
                icon={<BookOpen className="w-4 h-4" />}
                className="w-full sm:w-auto rounded-xl font-extrabold bg-amber-600 hover:bg-amber-700 border-none h-12 px-8 text-xs shadow-md"
              >
                Xem Sổ Mượn Sách Của Tôi
              </Button>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
