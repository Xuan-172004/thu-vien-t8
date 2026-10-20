import React from 'react';
import { Tag, Button, Tooltip, Popconfirm } from 'antd';
import { CreditCard, Sparkles, ShieldCheck, Clock, AlertCircle, XCircle, CheckCircle2, UserCheck } from 'lucide-react';

export default function DigitalCardWidget({ cardData, onOpenRegister, onCancelApplication }) {
  const status = cardData?.cardStatus || 'none';
  const memberCode = cardData?.memberCode || 'CHƯA CẤP MÃ';
  const userType = cardData?.userType || 'student';

  const userTypeMap = {
    student: 'Thẻ Sinh Viên / Thành Viên',
    guest: 'Thẻ Khách Vãng Lai',
    staff: 'Thẻ Cán Bộ / Giảng Viên',
  };

  const statusConfig = {
    none: { color: 'default', text: 'Chưa đăng ký', bg: 'bg-stone-800 text-stone-300' },
    pending: { color: 'warning', text: 'Chờ duyệt hồ sơ', bg: 'bg-amber-500 text-stone-950 font-bold' },
    active: { color: 'success', text: 'Đang hoạt động', bg: 'bg-emerald-500 text-white font-bold' },
    rejected: { color: 'error', text: 'Từ chối duyệt', bg: 'bg-red-600 text-white font-bold' },
    expired: { color: 'default', text: 'Thẻ hết hạn', bg: 'bg-stone-600 text-white font-bold' },
    locked: { color: 'error', text: 'Thẻ bị khóa', bg: 'bg-red-600 text-white font-bold' },
    revoked: { color: 'error', text: 'Thẻ bị thu hồi', bg: 'bg-stone-900 text-white font-bold' },
  };

  const currentStatus = statusConfig[status] || statusConfig.none;

  return (
    <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xl shadow-amber-500/5 relative overflow-hidden font-sans">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <CreditCard className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-extrabold text-stone-900 text-base">Thẻ Thư Viện Kỹ Thuật Số</h3>
            <p className="text-xs text-stone-500">{userTypeMap[userType] || 'Thẻ bạn đọc'}</p>
          </div>
        </div>

        <span className={`text-xs px-2.5 py-1 rounded-full ${currentStatus.bg}`}>
          {currentStatus.text}
        </span>
      </div>

      {/* METALLIC DIGITAL CARD DISPLAY */}
      <div className="w-full aspect-[1.58/1] rounded-2xl bg-gradient-to-tr from-stone-900 via-stone-850 to-stone-950 text-white p-5 flex flex-col justify-between relative overflow-hidden shadow-2xl border border-stone-700/80">
        
        {/* Subtle Card Glow Effect */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-orange-600/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Metallic Header */}
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold">HỆ THỐNG THƯ VIỆN SÁCH</div>
            <div className="text-xs font-black tracking-tight text-white mt-0.5 uppercase">
              {userTypeMap[userType]}
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>

        {/* Center Card Body */}
        <div className="flex items-center gap-4 relative z-10 my-auto">
          {/* 3x4 Avatar Photo Frame */}
          <div className="w-14 h-18 rounded-lg bg-stone-800 border-2 border-amber-400/80 overflow-hidden shrink-0 shadow-md flex items-center justify-center">
            {cardData?.avatar ? (
              <img src={cardData.avatar} alt="3x4 Photo" className="w-full h-full object-cover" />
            ) : (
              <UserCheck className="w-7 h-7 text-stone-500" />
            )}
          </div>

          <div className="space-y-1">
            <div className="text-sm sm:text-base font-black tracking-wide text-white uppercase line-clamp-1">
              {cardData?.fullName || 'CHƯA ĐĂNG KÝ HỌ TÊN'}
            </div>
            
            {/* Member Code */}
            <div className="font-mono text-amber-300 font-extrabold text-xs sm:text-sm tracking-wider bg-stone-900/80 px-2 py-0.5 rounded border border-stone-700 inline-block">
              {memberCode}
            </div>

            <div className="text-[10px] text-stone-400 font-medium">
              Hạn mượn tối đa: <strong className="text-white">{cardData?.maxBorrowLimit || (userType === 'guest' ? 2 : 5)} cuốn</strong>
            </div>
          </div>
        </div>

        {/* Bottom Card Footer with Expiry & Barcode Graphic */}
        <div className="flex items-end justify-between relative z-10 border-t border-stone-800 pt-2 text-[10px] text-stone-400">
          <div>
            <div>Hạn sử dụng thẻ</div>
            <div className="font-bold text-white font-mono text-xs">
              {cardData?.cardExpiryDate || 'Chờ cấp hạn'}
            </div>
          </div>

          {/* Barcode Graphic Representation */}
          <div className="flex items-end gap-0.5 h-6 bg-white px-2 py-1 rounded">
            {[...Array(16)].map((_, i) => (
              <div 
                key={i} 
                className={`bg-stone-950 h-full ${i % 3 === 0 ? 'w-1' : 'w-0.5'}`} 
              />
            ))}
          </div>
        </div>

      </div>

      {/* Rejection Notification if present */}
      {status === 'rejected' && cardData?.rejectReason && (
        <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong>Hồ sơ bị từ chối:</strong> {cardData.rejectReason}
          </div>
        </div>
      )}

      {/* Reader Action Buttons */}
      <div className="mt-5 flex items-center gap-3">
        {(status === 'none' || status === 'rejected' || status === 'expired') && (
          <Button
            type="primary"
            block
            size="large"
            className="font-bold rounded-xl text-xs sm:text-sm h-11"
            onClick={onOpenRegister}
          >
            {status === 'rejected' ? 'Đăng Ký Lại Thẻ Mới' : 'Đăng Ký Thẻ Trực Tuyến'}
          </Button>
        )}

        {status === 'pending' && (
          <Popconfirm
            title="Hủy yêu cầu đăng ký thẻ?"
            description="Bạn có chắc chắn muốn hủy hồ sơ chờ duyệt này?"
            onConfirm={onCancelApplication}
            okText="Đồng ý hủy"
            cancelText="Không"
            okButtonProps={{ danger: true }}
          >
            <Button
              danger
              block
              size="large"
              className="font-bold rounded-xl text-xs h-11"
            >
              Hủy Yêu Cầu Đăng Ký
            </Button>
          </Popconfirm>
        )}
      </div>

    </div>
  );
}
