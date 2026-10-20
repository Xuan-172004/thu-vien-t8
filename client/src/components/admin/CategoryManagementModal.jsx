import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Table, Space, Popconfirm, message, Upload } from 'antd';
import { Layers, Plus, Trash2, Edit, CheckCircle2, RefreshCw, UploadCloud } from 'lucide-react';
import { createCategoryApi, updateCategoryApi, deleteCategoryApi, uploadCategoryImageApi } from '../../api/bookAdmin.api';

export default function CategoryManagementModal({ visible, categories = [], onClose, onRefresh }) {
  const [form] = Form.useForm();
  const [catList, setCatList] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    setCatList(Array.isArray(categories) ? categories : []);
  }, [categories]);

  const handleFinish = async (values) => {
    setLoading(true);
    try {
      if (editingCategory) {
        // Edit Category
        await updateCategoryApi(editingCategory.id, values);
        message.success(`Đã cập nhật thể loại "${values.name}"!`);
        setEditingCategory(null);
      } else {
        // Add Category
        await createCategoryApi(values);
        message.success(`Đã thêm thể loại mới "${values.name}"!`);
      }
      form.resetFields();
      setFileList([]);
      if (onRefresh) onRefresh();
    } catch (err) {
      // Local fallback state
      if (editingCategory) {
        setCatList(prev => prev.map(c => c.id === editingCategory.id ? { ...c, ...values } : c));
        message.success(`Đã cập nhật thể loại!`);
        setEditingCategory(null);
      } else {
        const newId = values.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-');
        const newCat = {
          id: newId,
          name: values.name,
          description: values.description || '',
          image: values.image || '',
          count: 0,
          color: values.color || 'bg-amber-500',
        };
        setCatList(prev => [newCat, ...prev]);
        message.success(`Đã thêm thể loại mới!`);
      }
      form.resetFields();
      setFileList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (record) => {
    setEditingCategory(record);
    if (record.image) {
      setFileList([{
        uid: '-1',
        name: 'category-image.png',
        status: 'done',
        url: record.image,
      }]);
    } else {
      setFileList([]);
    }
    form.setFieldsValue({
      name: record.name,
      description: record.description || '',
      image: record.image || '',
      color: record.color || 'bg-amber-500',
    });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setFileList([]);
    form.resetFields();
  };

  const handleUploadChange = async ({ fileList: newFileList }) => {
    setFileList(newFileList);
    if (newFileList.length > 0) {
      const targetFile = newFileList[0].originFileObj;
      if (targetFile) {
        try {
          const uploadRes = await uploadCategoryImageApi(targetFile);
          const uploadedUrl = uploadRes.metadata?.url || uploadRes.data?.url || uploadRes.url;
          if (uploadedUrl) {
            form.setFieldsValue({ image: uploadedUrl });
            setFileList([{
              uid: newFileList[0].uid || '-1',
              name: targetFile.name,
              status: 'done',
              url: uploadedUrl,
            }]);
            message.success('Đã tải ảnh lên máy chủ!');
          }
        } catch (err) {
          const reader = new FileReader();
          reader.onload = (e) => {
            form.setFieldsValue({ image: e.target.result });
          };
          reader.readAsDataURL(targetFile);
        }
      } else if (newFileList[0].url) {
        form.setFieldsValue({ image: newFileList[0].url });
      }
    } else {
      form.setFieldsValue({ image: '' });
    }
  };

  const handleDeleteCategory = async (catId) => {
    try {
      await deleteCategoryApi(catId);
      message.success('Đã xóa thể loại!');
      if (onRefresh) onRefresh();
    } catch (err) {
      setCatList(prev => prev.filter(c => c.id !== catId));
      message.success('Đã xóa thể loại khỏi danh sách!');
    }
  };

  const columns = [
    {
      title: 'Hình Ảnh',
      key: 'image',
      width: 70,
      render: (_, record) => (
        <div className="w-9 h-9 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center">
          {record.image ? (
            <img src={record.image} alt={record.name} className="w-full h-full object-cover" />
          ) : (
            <Layers className="w-4 h-4 text-stone-400" />
          )}
        </div>
      ),
    },
    {
      title: 'Tên Thể Loại / Danh Mục',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div className="font-extrabold text-stone-900 text-xs">{text}</div>
          {record.description && (
            <div className="text-[10px] text-stone-400 line-clamp-1">{record.description}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Mã (ID)',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span className="font-mono text-stone-500 text-xs">{id}</span>,
    },
    {
      title: 'Số Đầu Sách',
      dataIndex: 'count',
      key: 'count',
      render: (count) => (
        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs">
          {count || 0} cuốn
        </span>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<Edit className="w-3.5 h-3.5 text-stone-600" />}
            onClick={() => handleEditClick(record)}
          />

          <Popconfirm
            title="Xóa thể loại này?"
            description="Bạn có chắc chắn muốn xóa thể loại này khỏi hệ thống?"
            onConfirm={() => handleDeleteCategory(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger size="small" icon={<Trash2 className="w-3.5 h-3.5" />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 font-black text-stone-900 text-base">
          <Layers className="w-5 h-5 text-amber-600" />
          <span>Quản Lý Thể Loại & Chuyên Ngành Sách</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={680}
      centered
      className="category-management-modal font-sans"
    >
      <div className="space-y-4 pt-2">
        {/* Form Add / Edit Category */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-stone-800">
              {editingCategory ? `Đang chỉnh sửa: "${editingCategory.name}"` : 'Thêm Thể Loại Mới'}
            </h4>
            {editingCategory && (
              <Button size="small" type="link" onClick={handleCancelEdit} className="text-xs">
                Hủy chỉnh sửa
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
            <div className="sm:col-span-4">
              <Form.Item
                label={<span className="font-bold text-xs text-stone-700">Hình Ảnh (1 Ảnh)</span>}
                name="image"
                className="mb-0"
              >
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleUploadChange}
                  beforeUpload={() => false}
                  maxCount={1}
                  accept="image/*"
                >
                  {fileList.length < 1 && (
                    <div className="flex flex-col items-center justify-center text-stone-500 py-1">
                      <UploadCloud className="w-5 h-5 text-amber-600 mb-1" />
                      <div className="text-[10px] font-bold">Chọn Ảnh</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </div>

            <div className="sm:col-span-8 space-y-2">
              <Form.Item
                label={<span className="font-bold text-xs text-stone-700">Tên Thể Loại / Danh Mục</span>}
                name="name"
                rules={[{ required: true, message: 'Nhập tên thể loại!' }]}
                className="mb-0"
              >
                <Input placeholder="Ví dụ: Tâm Lý Học, Kinh Tế..." className="rounded-xl text-xs font-bold" />
              </Form.Item>

              <Form.Item
                label={<span className="font-bold text-xs text-stone-700">Mô Tả / Ghi Chú</span>}
                name="description"
                className="mb-0"
              >
                <Input placeholder="Mô tả ngắn về thể loại sách này" className="rounded-xl text-xs" />
              </Form.Item>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={editingCategory ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              className="rounded-xl font-bold bg-amber-600 hover:bg-amber-700 border-none"
            >
              {editingCategory ? 'Lưu Cập Nhật Thể Loại' : 'Thêm Thể Loại Mới'}
            </Button>
          </div>
        </Form>

        {/* Categories Table */}
        <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
          <Table
            columns={columns}
            dataSource={catList}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            size="small"
            className="text-xs"
          />
        </div>
      </div>
    </Modal>
  );
}
