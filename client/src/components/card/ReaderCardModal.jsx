import React, { useState, useEffect } from 'react';
import { Modal, message } from 'antd';
import DigitalCardWidget from './DigitalCardWidget';
import CardRegisterModal from './CardRegisterModal';
import { getMyCardApi, registerCardApi, cancelCardApi } from '../../api/card.api';
import { useAuth } from '../../context/AuthContext';

export default function ReaderCardModal({ visible, onClose }) {
  const { user, isAuthenticated } = useAuth();
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);

  const fetchMyCard = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await getMyCardApi();
      const data = res.metadata || res.data || res;
      setCardData(data);
    } catch (err) {
      // Fallback user state
      setCardData(user ? {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        userType: user.userType || 'student',
        cardStatus: user.cardStatus || 'none',
        memberCode: user.memberCode || '',
        cardExpiryDate: user.cardExpiryDate || '',
        maxBorrowLimit: user.maxBorrowLimit || 5,
        avatar: user.avatar || '',
      } : null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible && isAuthenticated) {
      fetchMyCard();
    }
  }, [visible, isAuthenticated]);

  const handleRegisterSubmit = async (values) => {
    try {
      const res = await registerCardApi(values);
      message.success('Gửi hồ sơ đăng ký thẻ thư viện thành công! Vui lòng chờ Admin duyệt.');
      setRegisterModalVisible(false);
      fetchMyCard();
    } catch (err) {
      message.error(err.message || 'Đăng ký thất bại. Vui lòng thử lại!');
    }
  };

  const handleCancelApplication = async () => {
    try {
      await cancelCardApi();
      message.info('Đã hủy yêu cầu đăng ký thẻ.');
      fetchMyCard();
    } catch (err) {
      message.error(err.message || 'Không thể hủy yêu cầu.');
    }
  };

  return (
    <>
      <Modal
        title={null}
        open={visible}
        onCancel={onClose}
        footer={null}
        width={460}
        centered
        className="reader-card-modal font-sans"
      >
        <div className="pt-2">
          <DigitalCardWidget
            cardData={cardData || {
              fullName: user?.fullName,
              email: user?.email,
              phone: user?.phone,
              cardStatus: user?.cardStatus || 'none',
            }}
            onOpenRegister={() => setRegisterModalVisible(true)}
            onCancelApplication={handleCancelApplication}
          />
        </div>
      </Modal>

      {/* Card Register Modal */}
      <CardRegisterModal
        visible={registerModalVisible}
        onClose={() => setRegisterModalVisible(false)}
        onSubmit={handleRegisterSubmit}
        initialValues={{
          fullName: user?.fullName || '',
          email: user?.email || '',
          phone: user?.phone || '',
          userType: cardData?.userType || 'student',
        }}
      />
    </>
  );
}
