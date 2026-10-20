import React, { useState } from 'react';
import { Drawer, Button, Tag, Empty, Space } from 'antd';
import { BookOpen, ShoppingBag, Trash2, ArrowRight, PackageCheck, AlertCircle } from 'lucide-react';
import { useRentalCart } from '../../context/rentalCartContext';
import BorrowBookModal from './BorrowBookModal';

export default function RentalCartDrawer() {
  const { cartItems, removeFromCart, clearCart, cartDrawerOpen, setCartDrawerOpen } = useRentalCart();
  const [borrowModalVisible, setBorrowModalVisible] = useState(false);

  const handleOpenBorrowModal = () => {
    setBorrowModalVisible(true);
  };

  const handleBorrowSuccess = () => {
    clearCart();
    setCartDrawerOpen(false);
  };

  return (
    <>
      <Drawer
        title={
          <div className="flex items-center gap-2 font-black text-stone-900 text-base">
            <ShoppingBag className="w-5 h-5 text-amber-600" />
            <span>Giỏ Mượn Sách ({cartItems.length}/5)</span>
          </div>
        }
        placement="right"
        onClose={() => setCartDrawerOpen(false)}
        open={cartDrawerOpen}
        styles={{ wrapper: { width: 380 } }}
        footer={
          cartItems.length > 0 ? (
            <div className="space-y-2 p-1">
              <div className="flex items-center justify-between text-xs text-stone-500 font-bold">
                <span>Số lượng đầu sách chọn:</span>
                <strong className="text-amber-800 font-black">{cartItems.length} cuốn</strong>
              </div>
              <Button
                type="primary"
                block
                icon={<ArrowRight className="w-4 h-4" />}
                onClick={handleOpenBorrowModal}
                className="rounded-2xl font-extrabold bg-amber-600 hover:bg-amber-700 border-none h-11 text-xs shadow-sm"
              >
                Tiến Hành Đặt Mượn Sách
              </Button>
            </div>
          ) : null
        }
      >
        {cartItems.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500">Danh sách chọn mượn:</span>
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa tất cả</span>
              </button>
            </div>

            <div className="space-y-3">
              {cartItems.map((book) => (
                <div
                  key={book.id}
                  className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-3 relative group"
                >
                  <img
                    src={book.cover || book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'}
                    alt={book.title}
                    className="w-12 h-16 rounded-lg object-cover border border-stone-200 shrink-0"
                  />

                  <div className="flex-1 min-w-0 pr-6">
                    <h4 className="font-extrabold text-stone-900 text-xs line-clamp-2">{book.title}</h4>
                    <p className="text-[11px] text-stone-500 line-clamp-1">{book.author || 'Tác giả thư viện'}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <Tag color="emerald" className="font-bold text-[10px] m-0">Sẵn sàng mượn</Tag>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(book.id)}
                    className="absolute top-3 right-3 text-stone-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div className="space-y-1">
                  <p className="font-bold text-xs text-stone-700">Giỏ mượn sách đang trống!</p>
                  <p className="text-[11px] text-stone-400">Hãy duyệt danh mục sách và chọn "Thêm vào giỏ mượn"</p>
                </div>
              }
            />
          </div>
        )}
      </Drawer>

      <BorrowBookModal
        visible={borrowModalVisible}
        items={cartItems}
        onClose={() => setBorrowModalVisible(false)}
        onSuccess={handleBorrowSuccess}
      />
    </>
  );
}
