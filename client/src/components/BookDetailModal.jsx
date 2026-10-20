import React, { useState } from 'react';
import { Modal, Rate, Tag, Segmented, Button, Tooltip, message } from 'antd';
import { Star, ShieldCheck, ShoppingBag, Truck, Calendar, Sparkles, BookOpen } from 'lucide-react';

export default function BookDetailModal({ book, visible, onClose, onAddToCart }) {
  const [rentalDays, setRentalDays] = useState(14); // default 14 days

  if (!book) return null;

  const totalRentalCost = book.rentalPricePerDay * rentalDays;
  const grandTotal = totalRentalCost + book.depositPrice;

  const handleAddToCart = () => {
    onAddToCart({ ...book, rentalDays });
    message.success(`Đã thêm "${book.title}" (Thuê ${rentalDays} ngày) vào giỏ!`);
    onClose();
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={780}
      centered
      className="book-detail-modal"
    >
      <div className="pt-2 pb-2">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Cover & Badges */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-xl border border-stone-200 bg-stone-100">
              <img 
                src={book.cover} 
                alt={book.title} 
                className="w-full h-full object-cover"
              />
              {book.badge && (
                <span className="absolute top-3 left-3 bg-stone-900 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-sm">
                  {book.badge}
                </span>
              )}
            </div>

            <div className="w-full mt-4 p-3 bg-amber-50/80 rounded-xl border border-amber-200/60 text-xs text-amber-900 flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <strong>Cam kết hoàn 100% tiền cọc</strong> ngay khi nhận lại sách không hư hại lớn.
              </div>
            </div>
          </div>

          {/* Right Column: Information & Rental Calculator */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag color="orange" className="font-semibold">{book.categoryName}</Tag>
                <span className="text-xs text-stone-400">NXB: {book.publisher}</span>
              </div>

              <h2 className="text-xl md:text-2xl font-extrabold text-stone-900 leading-snug mb-1">
                {book.title}
              </h2>
              
              <p className="text-xs text-stone-500 font-medium mb-3">
                Tác giả: <strong className="text-stone-800">{book.author}</strong> • {book.pages} trang
              </p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <Rate disabled defaultValue={book.rating} allowHalf className="text-amber-500 text-sm" />
                <span className="text-xs font-bold text-stone-800">{book.rating}</span>
                <span className="text-xs text-stone-400">({book.reviewsCount} nhận xét từ người thuê)</span>
              </div>

              {/* Description */}
              <p className="text-xs text-stone-600 leading-relaxed mb-5 bg-stone-50 p-3 rounded-xl border border-stone-100 line-clamp-4">
                {book.description}
              </p>

              {/* Rental Duration Selection */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 mb-5">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    Chọn thời hạn thuê:
                  </span>
                  <span className="text-xs font-semibold text-amber-700">
                    {book.rentalPricePerDay.toLocaleString('vi-VN')}đ / ngày
                  </span>
                </div>

                <Segmented
                  block
                  value={rentalDays}
                  onChange={setRentalDays}
                  options={[
                    { label: '7 Ngày (Thuê ngắn)', value: 7 },
                    { label: '14 Ngày (Phổ biến)', value: 14 },
                    { label: '30 Ngày (Tiết kiệm)', value: 30 },
                  ]}
                  className="font-semibold text-xs"
                />
              </div>

              {/* Calculation Breakdown */}
              <div className="space-y-2 text-xs border-t border-stone-100 pt-3 mb-4">
                <div className="flex justify-between text-stone-600">
                  <span>Tiền thuê ({rentalDays} ngày):</span>
                  <span className="font-bold text-amber-600">
                    {totalRentalCost.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>Tiền cọc bảo đảm (hoàn lại):</span>
                  <span className="font-bold text-stone-800">
                    {book.depositPrice.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                <div className="flex justify-between text-stone-900 font-extrabold text-sm border-t border-dashed border-stone-200 pt-2">
                  <span>TỔNG THANH TOÁN TẠM TÍNH:</span>
                  <span className="text-amber-600">
                    {grandTotal.toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button 
                type="primary" 
                size="large"
                icon={<ShoppingBag className="w-4 h-4" />}
                className="flex-1 font-bold h-11 text-xs sm:text-sm"
                onClick={handleAddToCart}
              >
                Xác Nhận Thuê ({grandTotal.toLocaleString('vi-VN')}đ)
              </Button>
            </div>

          </div>

        </div>
      </div>
    </Modal>
  );
}
