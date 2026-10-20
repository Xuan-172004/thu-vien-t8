import React, { useState } from 'react';
import { Modal, Form, InputNumber, Radio, Button, Tag, Alert } from 'antd';
import { Wallet, CreditCard, ShieldCheck, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { createDepositApi } from '../../api/payment.api';
import { useAuth } from '../../context/AuthContext';
import showToast from '../../utils/toast';

export default function WalletDepositModal({ visible, onClose, onSuccess }) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const auth = useAuth() || {};
  const { user } = auth;

  const presetAmounts = [100000, 200000, 500000, 1000000];

  const handleSelectPreset = (amt) => {
    form.setFieldsValue({ amount: amt });
  };

  const handleFinish = async (values) => {
    setSubmitting(true);
    try {
      const payload = {
        userId: user?.id,
        amount: values.amount,
        paymentMethod: values.paymentMethod || 'vnpay',
      };

      const res = await createDepositApi(payload);
      const payUrl = res.metadata?.payUrl || res.data?.payUrl;

      if (payUrl) {
        showToast.info('Đang chuyển hướng sang cổng thanh toán...');
        window.location.href = payUrl;
      } else {
        showToast.success('Tạo giao dịch nạp tiền thành công!');
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      showToast.error(err.response?.data?.message || err.message || 'Không thể tạo cổng nạp tiền!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
      centered
      className="font-sans"
    >
      <div className="space-y-5 pt-2">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <Wallet className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-black text-stone-900 text-base">Nạp Tiền Vào Ví Thư Viện Sách</h3>
            <p className="text-xs text-stone-500 font-medium">Cổng thanh toán bảo mật tích hợp MoMo & VNPay Sandbox</p>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            amount: 200000,
            paymentMethod: 'vnpay',
          }}
          className="space-y-4"
        >
          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <label className="font-bold text-xs text-stone-700 block">Chọn Nhanh Mức Nạp (VNĐ)</label>
            <div className="grid grid-cols-4 gap-2">
              {presetAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleSelectPreset(amt)}
                  className="py-2 rounded-xl text-xs font-black border border-stone-200 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-900 transition-all"
                >
                  {(amt / 1000).toLocaleString()}k
                </button>
              ))}
            </div>
          </div>

          {/* Amount Field */}
          <Form.Item
            label={<span className="font-bold text-xs text-stone-700">Số Tiền Nạp Tùy Chỉnh (VNĐ)</span>}
            name="amount"
            rules={[{ required: true, message: 'Nhập số tiền nạp!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={10000}
              step={50000}
              formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VNĐ"
              className="rounded-xl text-sm font-black text-amber-900"
            />
          </Form.Item>

          {/* Payment Method Selector */}
          <Form.Item
            label={<span className="font-bold text-xs text-stone-700">Cổng Thanh Toán Trực Tuyến</span>}
            name="paymentMethod"
            rules={[{ required: true }]}
          >
            <Radio.Group className="grid grid-cols-2 gap-3 w-full">
              <Radio.Button value="vnpay" className="rounded-xl font-extrabold text-xs h-14 flex items-center justify-center border-stone-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-[10px]">
                    VNPAY
                  </div>
                  <div className="text-left">
                    <div className="text-stone-900 font-extrabold text-xs">Cổng VNPay</div>
                    <div className="text-[10px] text-stone-400 font-normal">ATM / QR Pay / VNPAY App</div>
                  </div>
                </div>
              </Radio.Button>

              <Radio.Button value="momo" className="rounded-xl font-extrabold text-xs h-14 flex items-center justify-center border-stone-200">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-pink-600 text-white font-black flex items-center justify-center text-[10px]">
                    MoMo
                  </div>
                  <div className="text-left">
                    <div className="text-stone-900 font-extrabold text-xs">Ví MoMo</div>
                    <div className="text-[10px] text-stone-400 font-normal">Ví điện tử MoMo App</div>
                  </div>
                </div>
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Alert
            message={<span className="font-bold text-xs">Cam kết bảo mật & hoàn cọc 100%</span>}
            description="Số tiền nạp vào Ví cọc sẽ tự động được sử dụng để bảo cọc khi mượn sách và hoàn lại 100% ngay khi trả sách về thư viện."
            type="info"
            showIcon
            className="rounded-2xl border-amber-200 bg-amber-50/70 text-xs"
          />

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button onClick={onClose} className="rounded-xl font-bold">
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              icon={<ArrowRight className="w-4 h-4" />}
              className="rounded-xl font-black bg-amber-600 hover:bg-amber-700 border-none h-11 px-8 text-xs shadow-md"
            >
              Tiến Hành Thanh Toán
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
