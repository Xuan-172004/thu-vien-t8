import React from 'react';
import { Drawer, Button, InputNumber, Empty, Tooltip, Tag, message } from 'antd';
import { ShoppingBag, Trash2, ShieldCheck, ArrowRight, Truck, Info } from 'lucide-react';

export default function CartDrawer({ 
  visible, 
  onClose, 
  cartItems, 
  onRemoveItem, 
  onUpdateDays,
  onCheckout
}) {
  const totalDailyPrice = cartItems.reduce((sum, item) => sum + item.rentalPricePerDay, 0);
  const totalDeposit = cartItems.reduce((sum, item) => sum + item.depositPrice, 0);
  const totalRentalCost = cartItems.reduce((sum, item) => sum + (item.rentalPricePerDay * (item.rentalDays || 14)), 0);
  const shippingFee = cartItems.length >= 3 || cartItems.length === 0 ? 0 : 15000;
  const grandTotal = totalRentalCost + totalDeposit + shippingFee;

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2 text-stone-900 font-bold">
          <ShoppingBag className="w-5 h-5 text-amber-600" />
          <span>Giỏ Mượn Sách Thư Viện ({cartItems.length})</span>
        </div>
      }
      placement="right"
      onClose={onClose}
      open={visible}
      width={480}
      className="cart-drawer"
    >
      {cartItems.length > 0 ? (
        <div className="flex flex-col h-full justify-between">
          
          {/* Items List */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            {cartItems.map((item) => (
              <div 
                key={item.id}
                className="bg-stone-50 rounded-xl p-3 border border-stone-200 flex gap-3 relative group"
              >
                {/* Image */}
                <img 
                  src={item.cover} 
                  alt={item.title} 
                  className="w-16 h-22 object-cover rounded-lg border border-stone-200 bg-white"
                />

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-stone-900 text-xs line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                      <button 
                        onClick={() => onRemoveItem(item.id)}
                        className="text-stone-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                        title="Xóa khỏi giỏ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                      Tác giả: {item.author}
                    </p>
                  </div>

                  {/* Duration & Pricing Controls */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-200/60">
                    <div className="flex items-center gap-1.5 text-xs text-stone-600">
                      <span>Thuê:</span>
                      <InputNumber
                        min={3}
                        max={90}
                        value={item.rentalDays || 14}
                        onChange={(val) => onUpdateDays(item.id, val)}
                        size="small"
                        className="w-16 text-center font-bold text-xs"
                      />
                      <span className="text-[11px]">ngày</span>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-amber-600">
                        {((item.rentalPricePerDay) * (item.rentalDays || 14)).toLocaleString('vi-VN')}đ
                      </div>
                      <div className="text-[10px] text-stone-400">
                        Cọc: {item.depositPrice.toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}

            {/* Shipping Promo Notification */}
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                {cartItems.length >= 3 ? (
                  <span>Bạn đủ điều kiện <strong>Miễn Phí Giao Hàng</strong> tận nơi!</span>
                ) : (
                  <span>Thuê thêm <strong>{3 - cartItems.length} cuốn</strong> nữa để nhận <strong>Freeship</strong>.</span>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Summary Footer */}
          <div className="pt-4 border-t border-stone-200 bg-white space-y-2.5 mt-4">
            
            <div className="flex justify-between text-xs text-stone-600">
              <span>Tổng tiền thuê sách:</span>
              <span className="font-semibold text-stone-900">{totalRentalCost.toLocaleString('vi-VN')}đ</span>
            </div>

            <div className="flex justify-between text-xs text-stone-600">
              <span className="flex items-center gap-1">
                Tiền đặt cọc (Hoàn trả 100%):
                <Tooltip title="Tiền cọc sẽ được hoàn trả lại ngay khi bạn trả lại sách toàn vẹn">
                  <Info className="w-3.5 h-3.5 text-stone-400 cursor-pointer" />
                </Tooltip>
              </span>
              <span className="font-semibold text-stone-900">{totalDeposit.toLocaleString('vi-VN')}đ</span>
            </div>

            <div className="flex justify-between text-xs text-stone-600">
              <span>Phí vận chuyển:</span>
              <span className="font-semibold text-stone-900">
                {shippingFee === 0 ? <Tag color="green" className="m-0 text-[10px]">MIỄN PHÍ</Tag> : `${shippingFee.toLocaleString('vi-VN')}đ`}
              </span>
            </div>

            <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-stone-200 text-stone-900">
              <span className="font-extrabold text-sm">TỔNG CỌC & THUÊ:</span>
              <span className="font-black text-xl text-amber-600">
                {grandTotal.toLocaleString('vi-VN')}đ
              </span>
            </div>

            <Button 
              type="primary" 
              size="large"
              block
              className="font-bold h-12 text-sm mt-2 flex items-center justify-center gap-2"
              onClick={onCheckout}
            >
              <span>Tiến Hành Thuê Sách</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

          </div>

        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center">
          <Empty 
            description={
              <span className="text-stone-500 font-medium text-sm">
                Giỏ sách thuê của bạn đang trống
              </span>
            } 
          />
        </div>
      )}
    </Drawer>
  );
}
