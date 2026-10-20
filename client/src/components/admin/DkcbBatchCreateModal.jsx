import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, message, Space } from 'antd';
import { Barcode, QrCode, PackageCheck, Layers, MapPin, Printer, Building } from 'lucide-react';

export default function DkcbBatchCreateModal({ visible, books = [], warehouses = [], shelves = [], onClose, onSubmit }) {
  const [form] = Form.useForm();
  const [selectedBook, setSelectedBook] = useState(null);
  const [count, setCount] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [selectedWhId, setSelectedWhId] = useState(null);

  const activeBooks = Array.isArray(books) ? books : [];
  const activeShelves = Array.isArray(shelves) ? shelves : [];
  const activeWarehouses = Array.isArray(warehouses) ? warehouses : [];

  useEffect(() => {
    if (visible) {
      const defaultWh = activeWarehouses[0]?.id;
      const defaultShelf = defaultWh ? activeShelves.find(s => s.warehouseId === defaultWh) : activeShelves[0];
      setSelectedWhId(defaultWh || null);
      form.setFieldsValue({
        bookId: activeBooks[0]?.id || undefined,
        count: 5,
        physicalCondition: 'good',
        warehouseId: defaultWh || undefined,
        shelfId: defaultShelf?.id || undefined,
        location: defaultShelf ? `${defaultShelf.name} (${defaultShelf.code})` : 'Kệ Kho A1-01',
      });
      if (activeBooks[0]) setSelectedBook(activeBooks[0]);
    }
  }, [visible, activeBooks, activeWarehouses, activeShelves, form]);

  const handleBookChange = (bookId) => {
    const b = activeBooks.find(item => item.id === bookId);
    setSelectedBook(b);
  };

  const handleWarehouseChange = (whId) => {
    setSelectedWhId(whId);
    const matchingShelf = activeShelves.find(s => s.warehouseId === whId);
    if (matchingShelf) {
      form.setFieldsValue({
        shelfId: matchingShelf.id,
        location: `${matchingShelf.name} (${matchingShelf.code})`,
      });
    } else {
      form.setFieldsValue({ shelfId: undefined });
    }
  };

  const handleShelfChange = (shelfId) => {
    const s = activeShelves.find(item => item.id === shelfId);
    if (s) {
      form.setFieldsValue({
        location: `${s.name} (${s.code})`,
        shelfId: s.id,
        warehouseId: s.warehouseId,
      });
      setSelectedWhId(s.warehouseId);
    }
  };

  const handleFinish = async (values) => {
    setSubmitting(true);
    try {
      await onSubmit(values);
      form.resetFields();
      setSelectedBook(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter shelves based on selected warehouse
  const filteredShelves = selectedWhId 
    ? activeShelves.filter(s => s.warehouseId === selectedWhId)
    : activeShelves;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 font-black text-stone-900 text-base">
          <Barcode className="w-5 h-5 text-amber-600" />
          <span>Cấp Hàng Loạt Mã Đăng Ký Cá Biệt (Mã ĐKCB)</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={680}
      centered
      className="dkcb-modal font-sans"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          count: 5,
          physicalCondition: 'good',
          location: 'Kệ A1 - Lập trình & CNTT (KE-A1)',
        }}
        className="pt-2 space-y-4"
      >
        <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Mỗi bản sao vật lý sẽ được gán 01 mã ĐKCB duy nhất (ví dụ: <strong className="font-mono text-amber-800">DKCB-2026-XXXX</strong>) để dán nhãn Barcode tra cứu mượn trả.</span>
          </div>
        </div>

        <Form.Item
          label={<span className="font-bold text-xs text-stone-700">Chọn Đầu Sách Nhập Kho</span>}
          name="bookId"
          rules={[{ required: true, message: 'Vui lòng chọn đầu sách!' }]}
        >
          <Select
            showSearch
            placeholder="Tìm theo tên sách, ISBN..."
            optionFilterProp="label"
            onChange={handleBookChange}
            className="rounded-xl text-xs"
            options={activeBooks.map(b => ({
              value: b.id,
              label: `${b.title} (ISBN: ${b.isbn || 'N/A'})`,
            }))}
          />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Form.Item
            label={<span className="font-bold text-xs text-stone-700">Kho Sách Nhập Vào</span>}
            name="warehouseId"
          >
            <Select
              placeholder="Chọn Kho sách..."
              onChange={handleWarehouseChange}
              className="rounded-xl text-xs"
              allowClear
              options={activeWarehouses.map(w => ({
                value: w.id,
                label: `${w.name} (${w.code})`,
              }))}
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-xs text-stone-700">Chọn Tủ / Kệ Lắp Đặt (Từ Cơ Sở Dữ Liệu)</span>}
            name="shelfId"
            rules={[{ required: true, message: 'Vui lòng chọn tủ/kệ lắp đặt!' }]}
          >
            <Select
              placeholder="Chọn tủ/kệ trong kho..."
              onChange={handleShelfChange}
              className="rounded-xl text-xs font-bold text-amber-900"
              options={filteredShelves.map(s => ({
                value: s.id,
                label: `${s.name} (${s.code})`,
              }))}
            />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Form.Item
            label={<span className="font-bold text-xs text-stone-700">Số Lượng Bản Sao ĐKCB</span>}
            name="count"
            rules={[{ required: true }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={1}
              max={100}
              onChange={(val) => setCount(val || 1)}
              className="rounded-xl text-xs font-bold text-amber-700"
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-xs text-stone-700">Tình Trạng Vật Lý Sách</span>}
            name="physicalCondition"
            rules={[{ required: true }]}
          >
            <Select
              className="rounded-xl text-xs"
              options={[
                { value: 'new', label: 'Mới 100%' },
                { value: 'good', label: 'Rất tốt (95%)' },
                { value: 'fair', label: 'Cũ (80%)' },
                { value: 'damaged', label: 'Hỏng hóc' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-xs text-stone-700">Chuỗi Vị Trí Hiển Thị</span>}
            name="location"
          >
            <Input placeholder="Tự động điền theo Tủ/Kệ" className="rounded-xl text-xs font-bold bg-stone-50" readOnly />
          </Form.Item>
        </div>

        {/* Live Preview Barcode Label */}
        {selectedBook && (
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-stone-800">
              <span className="flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-amber-600" />
                <span>Xem Trước Mẫu Nhãn Barcode ĐKCB Đăng Ký ({count} tem)</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              {Array.from({ length: Math.min(count, 3) }).map((_, idx) => (
                <div key={idx} className="bg-white p-2.5 rounded-xl border border-stone-300 shadow-2xs text-center font-mono text-[10px]">
                  <div className="font-sans font-bold text-stone-900 line-clamp-1 text-[11px] mb-0.5">{selectedBook.title}</div>
                  <div className="tracking-widest font-black text-amber-800 text-xs">
                    DKCB-2026-{(idx + 1).toString().padStart(4, '0')}
                  </div>
                  <div className="w-full h-5 bg-stone-900 my-1 flex items-center justify-center text-white text-[8px] font-sans rounded">
                    ||||| ||| ||||||| ||||| ||
                  </div>
                  <div className="text-[9px] text-stone-500 font-sans">THƯ VIỆN TRUNG TÂM</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
          <Button onClick={onClose} className="rounded-xl font-bold">
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            icon={<PackageCheck className="w-4 h-4" />}
            className="rounded-xl font-bold bg-amber-600 hover:bg-amber-700 border-none h-10 px-6"
          >
            Cấp {count} Mã ĐKCB Ngay
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
