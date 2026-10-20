import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Switch, Button, Tabs, message, Tooltip, Alert, Spin } from 'antd';
import { 
  BookOpen, 
  UploadCloud, 
  Camera, 
  Tag, 
  DollarSign, 
  Layers, 
  Hash, 
  Building, 
  Calendar, 
  Sparkles, 
  MapPin, 
  Maximize2,
  Star,
  Trash2,
  Images,
  Plus,
  Loader2
} from 'lucide-react';
import RichTextEditor from '../common/RichTextEditor';
import { uploadBookImagesApi } from '../../api/bookAdmin.api';

export default function BookEditModal({ visible, book, categories = [], onClose, onSave }) {
  const [form] = Form.useForm();
  const [coverPreview, setCoverPreview] = useState('');
  const [imagesList, setImagesList] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const isEditing = !!book;

  // Filter out aggregate 'all' from selectable category list
  const activeCategories = Array.isArray(categories) 
    ? categories.filter(c => c && c.id !== 'all') 
    : [];

  const defaultCategory = activeCategories[0]?.id || 'cong-nghe';

  useEffect(() => {
    if (visible) {
      if (book) {
        form.setFieldsValue({
          title: book.title || '',
          slug: book.slug || '',
          author: book.author || '',
          isbn: book.isbn || '',
          ddcCode: book.ddcCode || '',
          categoryId: book.categoryId || defaultCategory,
          publisher: book.publisher || '',
          year: book.year || new Date().getFullYear(),
          pages: book.pages || 300,
          language: book.language || 'Tiếng Việt',
          dimensions: book.dimensions || '14.5 x 20.5 x 1.5 cm',
          weight: book.weight || 350,
          room: book.room || 'Phòng Kho 01',
          floor: book.floor || 'Tầng 2',
          shelf: book.shelf || 'Kệ A1-01',
          price7Days: book.price7Days || 15000,
          price14Days: book.price14Days || 25000,
          price30Days: book.price30Days || 45000,
          deposit: book.deposit || 50000,
          marketPrice: book.marketPrice || 150000,
          totalCopies: book.totalCopies || 5,
          cover: book.cover || '',
          isFeatured: book.isFeatured || false,
          isVisible: book.isVisible !== undefined ? book.isVisible : true,
          summary: book.summary || book.description || '',
        });
        setCoverPreview(book.cover || '');
        const initialImages = Array.isArray(book.images) && book.images.length > 0 
          ? book.images 
          : (book.cover ? [book.cover] : []);
        setImagesList(initialImages);
      } else {
        form.resetFields();
        const defaultCover = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80';
        form.setFieldsValue({
          categoryId: defaultCategory,
          year: new Date().getFullYear(),
          pages: 300,
          language: 'Tiếng Việt',
          dimensions: '14.5 x 20.5 x 1.5 cm',
          weight: 350,
          room: 'Phòng Kho 01',
          floor: 'Tầng 2',
          shelf: 'Kệ A1-01',
          price7Days: 15000,
          price14Days: 25000,
          price30Days: 45000,
          deposit: 50000,
          marketPrice: 150000,
          totalCopies: 5,
          cover: defaultCover,
          isFeatured: false,
          isVisible: true,
        });
        setCoverPreview(defaultCover);
        setImagesList([defaultCover]);
      }
    }
  }, [book, visible, form, defaultCategory]);

  // Auto generate slug from title
  const handleTitleChange = (e) => {
    const titleVal = e.target.value;
    if (!isEditing || !form.getFieldValue('slug')) {
      const generatedSlug = titleVal
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      form.setFieldsValue({ slug: generatedSlug });
    }
  };

  // Handle Multi Image Files Upload to Server
  const handleMultiFilesChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(f => f.type.startsWith('image/'));
    if (validFiles.length < files.length) {
      message.warning('Một số tệp không phải định dạng hình ảnh đã bị bỏ qua!');
    }

    if (validFiles.length === 0) return;

    // Check size limit (< 10MB per file)
    const oversized = validFiles.find(f => f.size > 10 * 1024 * 1024);
    if (oversized) {
      message.error(`File ${oversized.name} vượt quá dung lượng 10MB cho phép!`);
      return;
    }

    setUploadingImages(true);
    try {
      const res = await uploadBookImagesApi(validFiles);
      const newUrls = res.metadata?.urls || (res.metadata?.url ? [res.metadata.url] : []);
      
      if (newUrls.length > 0) {
        setImagesList(prev => {
          const filteredPrev = prev.filter(img => !img.includes('unsplash.com'));
          const updated = [...filteredPrev, ...newUrls];
          // Update main cover preview
          if (!coverPreview || coverPreview.includes('unsplash.com') || filteredPrev.length === 0) {
            setCoverPreview(newUrls[0]);
            form.setFieldsValue({ cover: newUrls[0] });
          }
          return updated;
        });
        message.success(`Đã tải lên ${newUrls.length} ảnh sách thành công!`);
      }
    } catch (err) {
      console.error('Lỗi khi tải ảnh sách lên server:', err);
      message.error(err.response?.data?.message || 'Lỗi khi tải ảnh lên server. Vui lòng thử lại!');
    } finally {
      setUploadingImages(false);
      // Reset input value to allow re-uploading the same file if needed
      e.target.value = '';
    }
  };

  // Set selected image as Primary Cover Photo
  const handleSetPrimaryCover = (imgUrl) => {
    setCoverPreview(imgUrl);
    form.setFieldsValue({ cover: imgUrl });
    message.success('Đã chọn làm ảnh bìa chính!');
  };

  // Delete image from gallery
  const handleDeleteImage = (indexToDelete) => {
    setImagesList(prev => {
      const updated = prev.filter((_, idx) => idx !== indexToDelete);
      if (coverPreview === prev[indexToDelete] && updated.length > 0) {
        setCoverPreview(updated[0]);
        form.setFieldsValue({ cover: updated[0] });
      }
      return updated;
    });
    message.success('Đã xóa ảnh!');
  };

  const handleSubmit = async (values) => {
    if (!values.cover && coverPreview) {
      values.cover = coverPreview;
    }

    if (!values.cover) {
      message.error('Vui lòng chọn ảnh bìa sách!');
      return;
    }

    const selectedCat = activeCategories.find((c) => c.id === values.categoryId);
    const payload = {
      ...values,
      cover: values.cover || coverPreview,
      categoryName: selectedCat ? selectedCat.name : 'Chưa phân loại',
      description: values.summary || '',
      images: imagesList.length > 0 ? imagesList : [values.cover || coverPreview],
      price7Days: Number(values.price7Days) || 15000,
      price14Days: Number(values.price14Days) || 25000,
      price30Days: Number(values.price30Days) || 45000,
      deposit: Number(values.deposit) || 50000,
      marketPrice: Number(values.marketPrice) || 150000,
      totalCopies: Number(values.totalCopies) || 5,
    };

    try {
      await onSave(payload, isEditing ? book.id : null);
    } catch (err) {
      console.error('Error submitting book modal:', err);
    }
  };

  const tabItems = [
    {
      key: 'basic',
      label: (
        <span className="flex items-center gap-1.5 font-bold text-xs">
          <BookOpen className="w-4 h-4 text-amber-600" />
          <span>1. Thông Tin Cơ Bản & Bộ Ảnh Sách</span>
        </span>
      ),
      children: (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Left Column: Cover Photo Upload & Multi-Image Gallery */}
          <div className="sm:col-span-1 space-y-3">
            <div>
              <label className="font-bold text-xs text-stone-700 block mb-1">
                Ảnh Bìa Chính <span className="text-red-500">*</span>
              </label>

              <div className="w-full aspect-[1/1.4] rounded-2xl bg-stone-100 border-2 border-dashed border-amber-300 overflow-hidden relative shadow-sm flex flex-col items-center justify-center group">
                {uploadingImages ? (
                  <div className="flex flex-col items-center justify-center p-4 text-amber-600 space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <span className="text-xs font-bold">Đang tải ảnh lên server...</span>
                  </div>
                ) : coverPreview ? (
                  <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-3 text-stone-400">
                    <Camera className="w-8 h-8 mx-auto mb-1" />
                    <span className="text-xs font-bold">Khung Ảnh Bìa</span>
                  </div>
                )}
                {!uploadingImages && (
                  <div className="absolute top-2 left-2 bg-amber-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs">
                    <Star className="w-3 h-3 fill-white" />
                    <span>Ảnh Bìa Chính</span>
                  </div>
                )}
              </div>
            </div>

            {/* Clean Multi File Upload Input */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploadingImages}
                onChange={handleMultiFilesChange}
                className="hidden"
                id="book-cover-multi-file-input"
              />
              <label
                htmlFor="book-cover-multi-file-input"
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 ${
                  uploadingImages ? 'bg-amber-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700 cursor-pointer'
                } text-white rounded-xl font-bold text-xs shadow-xs transition-colors w-full`}
              >
                {uploadingImages ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang tải ảnh lên server...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 stroke-[2.2]" />
                    <span>Tải nhiều ảnh sách từ máy tính...</span>
                  </>
                )}
              </label>
            </div>

            {/* Multi Image Gallery Thumbnails */}
            {imagesList.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-stone-600">
                  <span className="flex items-center gap-1">
                    <Images className="w-3.5 h-3.5 text-amber-600" />
                    <span>Bộ ảnh phụ ({imagesList.length} ảnh)</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 bg-stone-50 rounded-xl border border-stone-200">
                  {imagesList.map((imgUrl, idx) => {
                    const isPrimary = coverPreview === imgUrl;
                    return (
                      <div
                        key={idx}
                        className={`aspect-square rounded-lg border-2 overflow-hidden relative group cursor-pointer ${
                          isPrimary ? 'border-amber-500 ring-2 ring-amber-400/30' : 'border-stone-200'
                        }`}
                      >
                        <img src={imgUrl} alt={`Sub image ${idx}`} className="w-full h-full object-cover" />
                        
                        {/* Hover Overlay Controls */}
                        <div className="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <Tooltip title="Đặt làm ảnh bìa chính">
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryCover(imgUrl)}
                              className="p-1 bg-amber-500 hover:bg-amber-600 text-white rounded-md"
                            >
                              <Star className="w-3 h-3 fill-white" />
                            </button>
                          </Tooltip>

                          <Tooltip title="Xóa ảnh này">
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(idx)}
                              className="p-1 bg-red-600 hover:bg-red-700 text-white rounded-md"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </Tooltip>
                        </div>

                        {isPrimary && (
                          <div className="absolute bottom-0 inset-x-0 bg-amber-600 text-white text-[8px] font-bold text-center py-0.2">
                            Bìa chính
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Form.Item name="cover" noStyle rules={[{ required: true, message: 'Thiếu ảnh bìa!' }]}>
              <Input type="hidden" />
            </Form.Item>
          </div>

          {/* Right Column: Book Basic Metadata Form Fields */}
          <div className="sm:col-span-2 space-y-3">
            <Form.Item
              label={<span className="font-bold text-xs text-stone-700">Tên Đầu Sách</span>}
              name="title"
              rules={[{ required: true, message: 'Vui lòng nhập tên đầu sách!' }]}
            >
              <Input
                onChange={handleTitleChange}
                placeholder="Ví dụ: Thiết Kế Web Chuẩn UX/UI"
                size="large"
                className="rounded-xl text-xs font-bold"
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-3">
              <Form.Item
                label={<span className="font-bold text-xs text-stone-700">Tác Giả</span>}
                name="author"
                rules={[{ required: true, message: 'Vui lòng nhập tác giả!' }]}
              >
                <Input placeholder="Tên tác giả" className="rounded-xl text-xs" />
              </Form.Item>

              <Form.Item
                label={<span className="font-bold text-xs text-stone-700">Thể Loại / Danh Mục</span>}
                name="categoryId"
                rules={[{ required: true }]}
              >
                <Select
                  className="rounded-xl text-xs"
                  options={activeCategories.map((cat) => ({
                    value: cat.id,
                    label: cat.name,
                  }))}
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Form.Item
                label={<span className="font-bold text-xs text-stone-700">Mã ISBN</span>}
                name="isbn"
                rules={[{ required: true, message: 'Vui lòng nhập ISBN!' }]}
              >
                <Input placeholder="978-604-x" className="rounded-xl text-xs font-mono" />
              </Form.Item>

              <Form.Item
                label={<span className="font-bold text-xs text-stone-700">Mã DDC</span>}
                name="ddcCode"
              >
                <Input placeholder="005.13" className="rounded-xl text-xs font-mono" />
              </Form.Item>

                <Form.Item
                    label={<span className="font-bold text-xs text-stone-700">Nhà Xuất Bản</span>}
                    name="publisher"
                    rules={[{ required: true, message: 'Vui lòng nhập nhà xuất bản!' }]}
>
                    <Input placeholder="NXB Trẻ" className="rounded-xl text-xs" />
                    </Form.Item>

              <Form.Item
                label={<span className="font-bold text-xs text-stone-700">NXB / Năm XB</span>}
                name="year"
              >
                <InputNumber style={{ width: '100%' }} min={1900} max={2030} className="rounded-xl text-xs" />
              </Form.Item>
            </div>

            <Form.Item
              label={<span className="font-bold text-xs text-stone-700">Tóm Tắt / Mô Tả Nội Dung (Trình Soạn Thảo Rich Text)</span>}
              name="summary"
            >
              <RichTextEditor placeholder="Nhập tóm tắt, mô tả chi tiết nội dung cuốn sách với định dạng Word (In đậm, in nghiêng, danh sách...)" />
            </Form.Item>
          </div>
        </div>
      ),
    },
    {
      key: 'physical',
      label: (
        <span className="flex items-center gap-1.5 font-bold text-xs">
          <Maximize2 className="w-4 h-4 text-amber-600" />
          <span>2. Vật Lý & Vị Trí Kho</span>
        </span>
      ),
      children: (
        <div className="space-y-4 pt-2">
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
            <h4 className="font-extrabold text-xs text-stone-900 flex items-center gap-1.5">
              <Maximize2 className="w-4 h-4 text-amber-600" />
              <span>Thông Số Vật Lý Của Sách</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <Form.Item
                label={<span className="font-bold text-xs text-stone-700">Số Trang</span>}
                name="pages"
              >
                <InputNumber style={{ width: '100%' }} min={1} className="rounded-xl text-xs" />
              </Form.Item>

              <Form.Item
                label={<span className="font-bold text-xs text-stone-700">Ngôn Ngữ</span>}
                name="language"
              >
                <Input placeholder="Tiếng Việt" className="rounded-xl text-xs" />
              </Form.Item>

              <Form.Item
                label={<span className="font-bold text-xs text-stone-700">Kích Thước (cm)</span>}
                name="dimensions"
              >
                <Input placeholder="14.5 x 20.5 x 1.5 cm" className="rounded-xl text-xs font-mono" />
              </Form.Item>

              <Form.Item
                label={<span className="font-bold text-xs text-stone-700">Trọng Lượng (g)</span>}
                name="weight"
              >
                <InputNumber style={{ width: '100%' }} min={1} addonAfter="gram" className="rounded-xl text-xs" />
              </Form.Item>
            </div>
          </div>

          <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-3">
            <h4 className="font-extrabold text-xs text-amber-950 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-700" />
              <span>Vị Trí Lưu Kho Thực Tế Trong Thư Viện</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Form.Item
                label={<span className="font-bold text-xs text-stone-700">Phòng / Kho</span>}
                name="room"
              >
                <Input placeholder="Phòng Kho 01" className="rounded-xl text-xs" />
              </Form.Item>

              <Form.Item
                label={<span className="font-bold text-xs text-stone-700">Tầng Lưu Kho</span>}
                name="floor"
              >
                <Input placeholder="Tầng 2" className="rounded-xl text-xs" />
              </Form.Item>

              <Form.Item
                label={<span className="font-bold text-xs text-stone-700">Tủ / Kệ Sách</span>}
                name="shelf"
              >
                <Input placeholder="Kệ A1-01" className="rounded-xl text-xs font-bold" />
              </Form.Item>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'pricing',
      label: (
        <span className="flex items-center gap-1.5 font-bold text-xs">
          <DollarSign className="w-4 h-4 text-amber-600" />
          <span>3. Giá Thuê & Cấu Hình</span>
        </span>
      ),
      children: (
        <div className="space-y-4 pt-2">
          <Alert
            message={<span className="font-bold text-xs">Cơ chế tính Phí Mượn & Tiền Cọc</span>}
            description="Đơn giá mượn theo ngày tự động áp dụng theo Bảng giá mượn lũy tiến của Hệ thống (Cấu hình tại Quản lý chính sách). ADMIN thiết lập Giá đặt cọc riêng cho từng cuốn sách theo giá trị bảo quản thực tế."
            type="info"
            showIcon
            className="rounded-2xl border-amber-200 bg-amber-50/70 text-xs"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              label={<span className="font-bold text-xs text-stone-700">Tiền Đặt Cọc Hoàn Trả (đ)</span>}
              name="deposit"
              rules={[{ required: true, message: 'Nhập tiền cọc!' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={5000}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value ? value.replace(/\$\s?|(,*)/g, '') : ''}
                className="rounded-xl text-xs font-bold text-amber-900"
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-xs text-stone-700">Giá Bìa Sách / Thị Trường (đ)</span>}
              name="marketPrice"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0}
                step={5000}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value ? value.replace(/\$\s?|(,*)/g, '') : ''}
                className="rounded-xl text-xs font-bold text-stone-800"
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200 items-center">
            <Form.Item
              label={<span className="font-bold text-xs text-stone-700">Số Lượng Bản Sách Kho</span>}
              name="totalCopies"
              rules={[{ required: true }]}
              className="mb-0"
            >
              <InputNumber
                style={{ width: '100%' }}
                min={1}
                max={500}
                className="rounded-xl text-xs font-bold"
              />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-xs text-stone-700">Sách Nổi Bật (Featured)</span>}
              name="isFeatured"
              valuePropName="checked"
              className="mb-0"
            >
              <Switch checkedChildren="Nổi bật" unCheckedChildren="Thường" className="bg-stone-300" />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-xs text-stone-700">Hiển Thị Trên Tra Cứu</span>}
              name="isVisible"
              valuePropName="checked"
              className="mb-0"
            >
              <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" className="bg-stone-300" />
            </Form.Item>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 font-black text-stone-900 text-base">
          <BookOpen className="w-5 h-5 text-amber-600" />
          <span>{isEditing ? 'Chỉnh Sửa Thông Tin Đầu Sách' : 'Thêm Đầu Sách Mới Về Kho'}</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={760}
      centered
      className="book-edit-modal font-sans"
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} className="pt-2">
        
        <Tabs defaultActiveKey="basic" items={tabItems} className="custom-book-tabs" />

        <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100 mt-2">
          <Button onClick={onClose} className="rounded-xl font-bold">
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" className="rounded-xl font-bold h-10 px-6 bg-amber-600 hover:bg-amber-700 border-none">
            {isEditing ? 'Cập Nhật Đầu Sách' : 'Thêm Sách Vào Kho'}
          </Button>
        </div>

      </Form>
    </Modal>
  );
}
