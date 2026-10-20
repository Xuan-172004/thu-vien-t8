import React, { createContext, useContext, useState, useEffect } from 'react';
import { message, Modal, Button } from 'antd';
import { CreditCard, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useAuth } from './AuthContext';
import { getMyCardApi } from '../api/card.api';
import ReaderCardModal from '../components/card/ReaderCardModal';

const RentalCartContext = createContext();

export function RentalCartProvider({ children }) {
  const auth = useAuth() || {};
  const { user, isAuthenticated } = auth;

  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('library_rental_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [cardModalVisible, setCardModalVisible] = useState(false);
  const [noticeModalVisible, setNoticeModalVisible] = useState(false);
  const [noticeModalContent, setNoticeModalContent] = useState({
    title: 'Yêu Cầu Thẻ Thư Viện Điện Tử',
    subtitle: 'Tài khoản của bạn chưa đăng ký Thẻ thư viện. Hãy hoàn tất đăng ký để mượn sách từ nhà trường!',
  });

  useEffect(() => {
    try {
      localStorage.setItem('library_rental_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  const addToCart = async (book) => {
    if (!book || !book.id) return;

    // 1. Check Authentication
    if (!isAuthenticated) {
      message.warning('Vui lòng đăng nhập và đăng ký Thẻ thư viện trước khi mượn sách!');
      window.location.href = '/auth';
      return;
    }

    // 2. Check Library Card Registration & Status
    try {
      const cardRes = await getMyCardApi();
      const card = cardRes?.metadata || cardRes?.data || cardRes;

      const cardStatus = card?.cardStatus || card?.status || user?.cardStatus || 'none';

      if (!card || cardStatus === 'none' || !card.memberCode) {
        setNoticeModalContent({
          title: 'Yêu Cầu Thẻ Thư Viện Điện Tử',
          subtitle: 'Tài khoản của bạn chưa có Thẻ thư viện. Bạn cần đăng ký Thẻ thư viện điện tử để thực hiện mượn sách từ nhà trường.',
        });
        setNoticeModalVisible(true);
        return;
      }

      if (cardStatus === 'pending') {
        message.warning('Thẻ thư viện của bạn đang chờ Admin duyệt. Vui lòng chờ kích hoạt thẻ trước khi mượn sách!');
        setCardModalVisible(true);
        return;
      }

      if (cardStatus === 'locked' || cardStatus === 'expired') {
        message.error('Thẻ thư viện của bạn đang bị khóa hoặc hết hạn. Vui lòng liên hệ thủ thư!');
        setCardModalVisible(true);
        return;
      }
    } catch (err) {
      console.warn('Card check warning:', err);
    }

    // 3. Check Cart duplicate & limits
    const exists = cartItems.some((item) => item.id === book.id);
    if (exists) {
      message.info(`Sách "${book.title}" đã có trong Giỏ mượn!`);
      return;
    }

    if (cartItems.length >= 5) {
      message.warning('Mỗi lần mượn sách tối đa 5 cuốn!');
      return;
    }

    setCartItems((prev) => [...prev, book]);
    message.success(`Đã thêm "${book.title}" vào Giỏ mượn sách!`);
  };

  const removeFromCart = (bookId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== bookId));
    message.success('Đã bỏ sách khỏi Giỏ mượn!');
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const isBookInCart = (bookId) => {
    return cartItems.some((item) => item.id === bookId);
  };

  return (
    <RentalCartContext.Provider
      value={{
        cartItems,
        totalItems: cartItems.length,
        addToCart,
        removeFromCart,
        clearCart,
        isBookInCart,
        cartDrawerOpen,
        setCartDrawerOpen,
      }}
    >
      {children}

      {/* Custom Theme Card Notice Modal */}
      <Modal
        open={noticeModalVisible}
        onCancel={() => setNoticeModalVisible(false)}
        footer={null}
        width={440}
        centered
        className="font-sans"
      >
        <div className="text-center space-y-4 pt-2 pb-1">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
            <CreditCard className="w-7 h-7 stroke-[2.2]" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-black text-stone-900">{noticeModalContent.title}</h3>
            <p className="text-xs text-stone-500 font-medium leading-relaxed max-w-xs mx-auto">
              {noticeModalContent.subtitle}
            </p>
          </div>

          <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200/70 text-left space-y-2 text-xs">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Quyền lợi khi đăng ký Thẻ thư viện:</span>
            </div>
            <ul className="space-y-1 text-stone-600 font-medium pl-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Mượn tối đa 5 cuốn sách cùng lúc</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Thời hạn mượn 14 ngày, gia hạn 24/7</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Nhận Thẻ đọc điện tử cá nhân</span>
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={() => setNoticeModalVisible(false)}
              className="rounded-xl font-bold text-xs flex-1 h-11 border-stone-300"
            >
              Để Sau
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setNoticeModalVisible(false);
                setCardModalVisible(true);
              }}
              icon={<CreditCard className="w-4 h-4" />}
              className="rounded-xl font-extrabold text-xs flex-1 h-11 bg-amber-600 hover:bg-amber-700 border-none shadow-md"
            >
              Đăng Ký Thẻ Ngay
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Global Card Register / View Modal */}
      <ReaderCardModal
        visible={cardModalVisible}
        onClose={() => setCardModalVisible(false)}
      />
    </RentalCartContext.Provider>
  );
}

export function useRentalCart() {
  const context = useContext(RentalCartContext);
  if (!context) {
    throw new Error('useRentalCart must be used within a RentalCartProvider');
  }
  return context;
}
