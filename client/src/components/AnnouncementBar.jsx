import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function AnnouncementBar({ onBannerClick }) {
  return (
    <div 
      onClick={onBannerClick}
      className="bg-amber-100/90 text-amber-950 py-2 px-4 text-center text-xs md:text-sm font-medium flex items-center justify-center gap-2 cursor-pointer hover:bg-amber-200/90 transition-colors border-b border-amber-200/60"
    >
      <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
      <span>
        Chào mừng bạn đọc: Mượn đọc sách in <strong>0 VNĐ miễn phí 100%</strong> + Đọc thử kho tài liệu số & đồ án trực tuyến!
      </span>
      <ArrowRight className="w-4 h-4 text-amber-900 stroke-[2.5]" />
    </div>
  );
}
