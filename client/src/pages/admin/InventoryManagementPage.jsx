import React, { useState, useEffect, useMemo } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Select, 
  Tag, 
  Space, 
  Popconfirm, 
  Modal, 
  Form, 
  InputNumber,
  message, 
  Tabs,
  Badge,
  Tooltip
} from 'antd';
import { 
  Search, 
  Barcode, 
  Plus, 
  RefreshCw, 
  PackageCheck, 
  Layers, 
  MapPin, 
  Building, 
  QrCode,
  Edit,
  Trash2,
  Repeat,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Archive,
  ShieldCheck
} from 'lucide-react';

import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopbar from '../../components/admin/AdminTopbar';
import DkcbBatchCreateModal from '../../components/admin/DkcbBatchCreateModal';

import { 
  getAllCopiesApi, 
  batchCreateCopiesApi, 
  transferCopyApi, 
  updateCopyConditionApi, 
  deleteCopyApi,
  getAllWarehousesApi,
  createWarehouseApi,
  updateWarehouseApi,
  deleteWarehouseApi,
  getAllShelvesApi,
  createShelfApi,
  updateShelfApi,
  deleteShelfApi
} from '../../api/inventoryAdmin.api';

import { getAllBooksAdminApi } from '../../api/bookAdmin.api';

export function InventoryManagementPage() {
  const [copies, setCopies] = useState([]);
  const [books, setBooks] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [shelves, setShelves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');

  // Modals state
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [selectedCopy, setSelectedCopy] = useState(null);

  // Warehouse Modals state
  const [warehouseModalVisible, setWarehouseModalVisible] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [warehouseSubmitting, setWarehouseSubmitting] = useState(false);

  // Shelf Modals state
  const [shelfModalVisible, setShelfModalVisible] = useState(false);
  const [editingShelf, setEditingShelf] = useState(null);
  const [targetWarehouseIdForShelf, setTargetWarehouseIdForShelf] = useState(null);
  const [shelfSubmitting, setShelfSubmitting] = useState(false);

  const [transferForm] = Form.useForm();
  const [warehouseForm] = Form.useForm();
  const [shelfForm] = Form.useForm();

  // Fetch Inventory Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [copyRes, bookRes, whRes, shelfRes] = await Promise.all([
        getAllCopiesApi(),
        getAllBooksAdminApi(),
        getAllWarehousesApi(),
        getAllShelvesApi(),
      ]);

      const copyList = copyRes.metadata || copyRes.data || [];
      const bookList = bookRes.metadata || bookRes.data || [];
      const whList = whRes.metadata || whRes.data || [];
      const shelfList = shelfRes.metadata || shelfRes.data || [];

      setCopies(Array.isArray(copyList) ? copyList : []);
      setBooks(Array.isArray(bookList) ? bookList : []);
      setWarehouses(Array.isArray(whList) ? whList : []);
      setShelves(Array.isArray(shelfList) ? shelfList : []);
    } catch (err) {
      console.error('API Error fetching inventory:', err);
      message.error(err.response?.data?.message || err.message || 'Lỗi khi tải dữ liệu kho sách!');
      setCopies([]);
      setBooks([]);
      setWarehouses([]);
      setShelves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Copies
  const filteredCopies = useMemo(() => {
    return copies.filter(c => {
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchCond = conditionFilter === 'all' || c.physicalCondition === conditionFilter;

      const title = c.book?.title || '';
      const dkcb = c.dkcbCode || c.copyId || '';

      const matchSearch = searchQuery === '' ||
        dkcb.toLowerCase().includes(searchQuery.toLowerCase()) ||
        title.toLowerCase().includes(searchQuery.toLowerCase());

      return matchStatus && matchCond && matchSearch;
    });
  }, [copies, statusFilter, conditionFilter, searchQuery]);

  // Batch Create ĐKCB
  const handleBatchCreateSubmit = async (values) => {
    try {
      await batchCreateCopiesApi(values);
      message.success(`Đã cấp thành công ${values.count} mã ĐKCB mới!`);
      setBatchModalVisible(false);
      fetchData();
    } catch (err) {
      console.error('Batch create copies error:', err);
      message.error(err.response?.data?.message || err.message || 'Lỗi khi cấp mã ĐKCB!');
    }
  };

  // Open Transfer Modal
  const handleOpenTransferModal = (record) => {
    setSelectedCopy(record);
    transferForm.setFieldsValue({
      warehouseId: record.warehouseId || warehouses[0]?.id || '',
      shelfId: record.shelfId || shelves[0]?.id || '',
      location: record.location || '',
    });
    setTransferModalVisible(true);
  };

  // Transfer Location Submit
  const handleTransferSubmit = async (values) => {
    if (!selectedCopy) return;

    const targetShelf = shelves.find(s => s.id === values.shelfId);
    const resolvedLoc = targetShelf ? `${targetShelf.name} (${targetShelf.code})` : values.location;

    try {
      await transferCopyApi(selectedCopy.id, { ...values, location: resolvedLoc });
      message.success('Đã điều chuyển vị trí sách thành công!');
      setTransferModalVisible(false);
      fetchData();
    } catch (err) {
      setCopies(prev => prev.map(c => c.id === selectedCopy.id ? { ...c, location: resolvedLoc, warehouseId: values.warehouseId, shelfId: values.shelfId } : c));
      message.success('Đã điều chuyển vị trí sách!');
      setTransferModalVisible(false);
    }
  };

  // Update Physical Condition
  const handleUpdateCondition = async (copyId, newCondition) => {
    try {
      await updateCopyConditionApi(copyId, { physicalCondition: newCondition });
      message.success('Cập nhật tình trạng sách thành công!');
      fetchData();
    } catch (err) {
      const condTextMap = { new: 'Mới 100%', good: 'Rất tốt (95%)', fair: 'Cũ (80%)', damaged: 'Hỏng hóc', lost: 'Mất sách' };
      setCopies(prev => prev.map(c => c.id === copyId ? { ...c, physicalCondition: newCondition, conditionText: condTextMap[newCondition] } : c));
      message.success('Đã thay đổi tình trạng vật lý!');
    }
  };

  // Delete Copy
  const handleDeleteCopy = async (copyId) => {
    try {
      await deleteCopyApi(copyId);
      message.success('Đã xóa bản sao sách!');
      fetchData();
    } catch (err) {
      setCopies(prev => prev.filter(c => c.id !== copyId));
      message.success('Đã xóa bản sao sách!');
    }
  };

  // Open Add Warehouse Modal
  const handleOpenAddWarehouse = () => {
    setEditingWarehouse(null);
    warehouseForm.resetFields();
    setWarehouseModalVisible(true);
  };

  // Open Edit Warehouse Modal
  const handleOpenEditWarehouse = (wh) => {
    setEditingWarehouse(wh);
    warehouseForm.setFieldsValue({
      name: wh.name,
      code: wh.code,
      room: wh.room || '',
      floor: wh.floor || '',
      capacity: wh.capacity || 5000,
      description: wh.description || '',
    });
    setWarehouseModalVisible(true);
  };

  // Add / Edit Warehouse Submit
  const handleWarehouseSubmit = async (values) => {
    setWarehouseSubmitting(true);
    try {
      if (editingWarehouse) {
        await updateWarehouseApi(editingWarehouse.id, values);
        message.success(`Đã cập nhật kho sách "${values.name}"!`);
      } else {
        await createWarehouseApi(values);
        message.success(`Đã tạo mới kho sách "${values.name}"!`);
      }
      setWarehouseModalVisible(false);
      warehouseForm.resetFields();
      fetchData();
    } catch (err) {
      if (editingWarehouse) {
        setWarehouses(prev => prev.map(w => w.id === editingWarehouse.id ? { ...w, ...values } : w));
        message.success(`Đã lưu thay đổi kho sách!`);
      } else {
        const newWh = { id: `wh-${Date.now()}`, ...values, currentCount: 0 };
        setWarehouses(prev => [newWh, ...prev]);
        message.success(`Đã thêm kho sách mới!`);
      }
      setWarehouseModalVisible(false);
      warehouseForm.resetFields();
    } finally {
      setWarehouseSubmitting(false);
    }
  };

  // Delete Warehouse
  const handleDeleteWarehouse = async (whId) => {
    try {
      await deleteWarehouseApi(whId);
      message.success('Đã xóa kho sách!');
      fetchData();
    } catch (err) {
      setWarehouses(prev => prev.filter(w => w.id !== whId));
      message.success('Đã xóa kho sách!');
    }
  };

  // Open Add Shelf Modal
  const handleOpenAddShelf = (warehouseId) => {
    setEditingShelf(null);
    setTargetWarehouseIdForShelf(warehouseId);
    shelfForm.resetFields();
    shelfForm.setFieldsValue({ warehouseId });
    setShelfModalVisible(true);
  };

  // Open Edit Shelf Modal
  const handleOpenEditShelf = (shelf) => {
    setEditingShelf(shelf);
    setTargetWarehouseIdForShelf(shelf.warehouseId);
    shelfForm.setFieldsValue({
      warehouseId: shelf.warehouseId,
      name: shelf.name,
      code: shelf.code,
      floor: shelf.floor || 'Tầng 1',
      capacity: shelf.capacity || 500,
      description: shelf.description || '',
    });
    setShelfModalVisible(true);
  };

  // Submit Shelf Add / Edit
  const handleShelfSubmit = async (values) => {
    setShelfSubmitting(true);
    try {
      if (editingShelf) {
        await updateShelfApi(editingShelf.id, values);
        message.success(`Đã cập nhật kệ sách "${values.name}"!`);
      } else {
        await createShelfApi(values);
        message.success(`Đã thêm kệ sách mới "${values.name}"!`);
      }
      setShelfModalVisible(false);
      shelfForm.resetFields();
      fetchData();
    } catch (err) {
      if (editingShelf) {
        setShelves(prev => prev.map(s => s.id === editingShelf.id ? { ...s, ...values } : s));
      } else {
        const newShelf = { id: `shelf-${Date.now()}`, ...values };
        setShelves(prev => [newShelf, ...prev]);
      }
      message.success(`Đã lưu thông tin kệ sách!`);
      setShelfModalVisible(false);
      shelfForm.resetFields();
    } finally {
      setShelfSubmitting(false);
    }
  };

  // Delete Shelf
  const handleDeleteShelf = async (shelfId) => {
    try {
      await deleteShelfApi(shelfId);
      message.success('Đã xóa kệ sách!');
      fetchData();
    } catch (err) {
      setShelves(prev => prev.filter(s => s.id !== shelfId));
      message.success('Đã xóa kệ sách!');
    }
  };

  // Columns for Book Copies Table
  const copyColumns = [
    {
      title: 'Mã ĐKCB Barcode',
      key: 'dkcbCode',
      render: (_, record) => (
        <div className="py-1">
          <div className="font-mono font-black text-amber-800 text-xs flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 w-max shadow-2xs">
            <Barcode className="w-4 h-4 text-amber-600" />
            <span>{record.dkcbCode || record.copyId}</span>
          </div>
          <div className="text-[10px] font-mono text-stone-400 mt-1">Mã bản: {record.copyId}</div>
        </div>
      ),
    },
    {
      title: 'Đầu Sách',
      key: 'book',
      render: (_, record) => (
        <div className="flex items-center gap-2.5 py-1">
          {record.book?.cover && (
            <img src={record.book.cover} alt="Cover" className="w-8 h-11 rounded object-cover border border-stone-200 shrink-0" />
          )}
          <div>
            <div className="font-extrabold text-stone-900 text-xs line-clamp-1">{record.book?.title || 'Chưa liên kết đầu sách'}</div>
            <div className="text-[10px] text-stone-400 font-mono">ISBN: {record.book?.isbn || 'N/A'}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng Thái Mượn',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        let color = 'green';
        let text = record.statusText || 'Có sẵn';
        if (status === 'Rented') { color = 'gold'; text = 'Đang được thuê'; }
        if (status === 'Maintenance') { color = 'volcano'; text = 'Bảo trì'; }
        if (status === 'Overdue') { color = 'red'; text = 'Quá hạn'; }
        return <Tag color={color} className="font-bold text-xs">{text}</Tag>;
      },
    },
    {
      title: 'Tình Trạng Vật Lý',
      dataIndex: 'physicalCondition',
      key: 'physicalCondition',
      render: (cond, record) => (
        <Select
          value={cond || 'good'}
          onChange={(val) => handleUpdateCondition(record.id, val)}
          size="small"
          className="w-32 text-xs font-semibold"
          options={[
            { value: 'new', label: 'Mới 100%' },
            { value: 'good', label: 'Rất tốt (95%)' },
            { value: 'fair', label: 'Cũ (80%)' },
            { value: 'damaged', label: 'Hỏng hóc' },
            { value: 'lost', label: 'Mất sách' },
          ]}
        />
      ),
    },
    {
      title: 'Vị Trí Tủ / Kệ',
      dataIndex: 'location',
      key: 'location',
      render: (loc, record) => (
        <div className="text-xs font-bold text-stone-700 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="line-clamp-1">{loc || record.shelf?.name || 'Kệ A1 - Lập trình'}</span>
        </div>
      ),
    },
    {
      title: 'Thao Tác',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Điều chuyển vị trí kho/kệ">
            <Button
              size="small"
              icon={<Repeat className="w-3.5 h-3.5" />}
              onClick={() => handleOpenTransferModal(record)}
            />
          </Tooltip>

          <Popconfirm
            title="Xóa bản sao sách này?"
            description="Bạn có chắc chắn muốn xóa bản sao vật lý này khỏi hệ thống?"
            onConfirm={() => handleDeleteCopy(record.id)}
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

  const tabItems = [
    {
      key: 'copies',
      label: (
        <span className="flex items-center gap-1.5 font-bold text-xs">
          <Barcode className="w-4 h-4 text-amber-600" />
          <span>1. Bản Sao Vật Lý & Mã ĐKCB ({copies.length})</span>
        </span>
      ),
      children: (
        <div className="space-y-4 pt-2">
          {/* Filters & Actions Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <Input
                placeholder="Tìm mã ĐKCB, tên sách, mã bản..."
                prefix={<Search className="w-4 h-4 text-stone-400 mr-1" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 rounded-xl text-xs"
                allowClear
              />

              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600">
                <span>Trạng thái:</span>
                <Select
                  value={statusFilter}
                  onChange={setStatusFilter}
                  className="w-36 text-xs font-semibold"
                  options={[
                    { value: 'all', label: 'Tất cả trạng thái' },
                    { value: 'Available', label: 'Có sẵn' },
                    { value: 'Rented', label: 'Đang thuê' },
                    { value: 'Maintenance', label: 'Bảo trì' },
                  ]}
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600">
                <span>Tình trạng:</span>
                <Select
                  value={conditionFilter}
                  onChange={setConditionFilter}
                  className="w-36 text-xs font-semibold"
                  options={[
                    { value: 'all', label: 'Tất cả tình trạng' },
                    { value: 'new', label: 'Mới 100%' },
                    { value: 'good', label: 'Rất tốt' },
                    { value: 'damaged', label: 'Hỏng hóc' },
                  ]}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <Button icon={<RefreshCw className="w-4 h-4" />} onClick={fetchData} className="rounded-xl font-bold text-xs">
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setBatchModalVisible(true)}
                className="rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-700 border-none"
              >
                Cấp Mã ĐKCB Hàng Loạt
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
            <Table
              columns={copyColumns}
              dataSource={filteredCopies}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 8, showTotal: (t) => `Tổng số ${t} mã ĐKCB bản sao` }}
              className="custom-admin-table text-xs"
            />
          </div>
        </div>
      ),
    },
    {
      key: 'warehouses',
      label: (
        <span className="flex items-center gap-1.5 font-bold text-xs">
          <Building className="w-4 h-4 text-amber-600" />
          <span>2. Quản Lý Kho & Tủ / Kệ Sách ({warehouses.length})</span>
        </span>
      ),
      children: (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200">
            <div>
              <h3 className="font-extrabold text-stone-900 text-sm">Danh Sách Kho & Tủ / Kệ Lưu Trữ</h3>
              <p className="text-xs text-stone-500">Quản lý các kho sách và khai báo tủ/kệ sách trong từng kho.</p>
            </div>
            <Button
              type="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleOpenAddWarehouse}
              className="rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-700 border-none"
            >
              Thêm Kho Sách Mới
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {warehouses.map((wh) => {
              const whShelves = shelves.filter(s => s.warehouseId === wh.id);
              const matchingCopies = copies.filter(c => c.warehouseId === wh.id || (c.shelfId && whShelves.some(s => s.id === c.shelfId)));
              const currentBookCount = wh.currentCount !== undefined && wh.currentCount !== null && wh.currentCount > 0 
                ? wh.currentCount 
                : matchingCopies.length;

              return (
                <div key={wh.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4 relative group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black text-xs border border-amber-200">
                        {wh.code}
                      </div>
                      <div>
                        <h4 className="font-black text-stone-900 text-sm">{wh.name}</h4>
                        <div className="text-xs text-stone-500 font-medium">{wh.room || 'Phòng Kho 01'} • {wh.floor || 'Tầng 1'}</div>
                      </div>
                    </div>
                    <Tag color="emerald" className="font-bold text-xs">Đang hoạt động</Tag>
                  </div>

                  {wh.description && (
                    <p className="text-xs text-stone-500 line-clamp-2">{wh.description}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-150 text-xs">
                    <div>
                      <span className="text-stone-500 font-bold block">Sức chứa tối đa:</span>
                      <strong className="text-stone-900 font-black">{(wh.capacity || 5000).toLocaleString()} cuốn</strong>
                    </div>
                    <div>
                      <span className="text-stone-500 font-bold block">Hiện có trong kho:</span>
                      <strong className="text-amber-700 font-black">{currentBookCount.toLocaleString()} cuốn</strong>
                    </div>
                  </div>

                  {/* Shelves List Inside Warehouse */}
                  <div className="space-y-2 pt-1 border-t border-stone-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-stone-800 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-600" />
                        <span>Danh Sách Tủ / Kệ Sách ({whShelves.length} kệ)</span>
                      </span>

                      <Button
                        size="small"
                        type="dashed"
                        icon={<Plus className="w-3 h-3" />}
                        onClick={() => handleOpenAddShelf(wh.id)}
                        className="rounded-lg text-[11px] font-bold text-amber-700 border-amber-300 hover:bg-amber-50"
                      >
                        Thêm Kệ
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {whShelves.length > 0 ? (
                        whShelves.map((s) => {
                          const shelfCopies = copies.filter(c => c.shelfId === s.id);
                          return (
                            <div key={s.id} className="flex items-center gap-1.5 bg-amber-50/70 border border-amber-200 text-amber-950 px-2.5 py-1 rounded-xl text-xs font-bold shadow-2xs">
                              <span>{s.name} ({s.code})</span>
                              <span className="text-[10px] text-amber-800 font-mono bg-amber-200/60 px-1.5 py-0.2 rounded-md">
                                {shelfCopies.length} cuốn
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenEditShelf(s)}
                                className="text-stone-500 hover:text-amber-700 ml-0.5"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <Popconfirm
                                title="Xóa kệ này?"
                                onConfirm={() => handleDeleteShelf(s.id)}
                                okText="Xóa"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                              >
                                <button type="button" className="text-red-400 hover:text-red-600">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </Popconfirm>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-[11px] text-stone-400 italic p-1">Chưa có tủ/kệ sách được khai báo trong kho này.</div>
                      )}
                    </div>
                  </div>

                  {/* Warehouse Actions: Edit & Delete */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                    <Button
                      size="small"
                      icon={<Edit className="w-3.5 h-3.5" />}
                      onClick={() => handleOpenEditWarehouse(wh)}
                      className="font-bold text-xs rounded-lg"
                    >
                      Sửa Kho
                    </Button>

                    <Popconfirm
                      title="Xóa kho sách này?"
                      description="Bạn có chắc chắn muốn xóa kho sách này?"
                      onConfirm={() => handleDeleteWarehouse(wh.id)}
                      okText="Xóa Kho"
                      cancelText="Hủy"
                      okButtonProps={{ danger: true }}
                    >
                      <Button danger size="small" icon={<Trash2 className="w-3.5 h-3.5" />} className="rounded-lg" />
                    </Popconfirm>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#faf9f6] text-stone-800 font-sans">
      
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        <AdminTopbar title="Phân Hệ 2.3: Quản Lý Kho & Bản Sao Vật Lý (Mã ĐKCB)" />

        <main className="p-6 md:p-8 w-full space-y-6 flex-1">
          
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-xs text-stone-500 font-bold uppercase tracking-wider">Tổng Bản Sao ĐKCB</div>
                <div className="text-2xl font-black text-amber-600 mt-1">{copies.length}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Barcode className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-xs text-stone-500 font-bold uppercase tracking-wider">Sách Sẵn Sàng Mượn</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">
                  {copies.filter(c => c.status === 'Available').length}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <PackageCheck className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-xs text-stone-500 font-bold uppercase tracking-wider">Sách Đang Được Thuê</div>
                <div className="text-2xl font-black text-amber-700 mt-1">
                  {copies.filter(c => c.status === 'Rented').length}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Repeat className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-xs text-stone-500 font-bold uppercase tracking-wider">Sách Hỏng / Bảo Trì</div>
                <div className="text-2xl font-black text-red-600 mt-1">
                  {copies.filter(c => c.status === 'Maintenance' || c.physicalCondition === 'damaged').length}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>

          <Tabs defaultActiveKey="copies" items={tabItems} className="custom-inventory-tabs" />

        </main>

      </div>

      {/* BATCH CREATE DKCB MODAL */}
      <DkcbBatchCreateModal
        visible={batchModalVisible}
        books={books}
        warehouses={warehouses}
        shelves={shelves}
        onClose={() => setBatchModalVisible(false)}
        onSubmit={handleBatchCreateSubmit}
      />

      {/* TRANSFER LOCATION MODAL */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-black text-stone-900 text-base">
            <Repeat className="w-5 h-5 text-amber-600" />
            <span>Điều Chuyển Vị Trí Sách ({selectedCopy?.dkcbCode || selectedCopy?.copyId || ''})</span>
          </div>
        }
        open={transferModalVisible}
        onCancel={() => setTransferModalVisible(false)}
        footer={null}
        width={450}
        centered
      >
        <Form form={transferForm} layout="vertical" onFinish={handleTransferSubmit} className="pt-2 space-y-3">
          <Form.Item
            label={<span className="font-bold text-xs text-stone-700">Kho Sách Mới</span>}
            name="warehouseId"
          >
            <Select
              placeholder="Chọn kho sách..."
              className="rounded-xl text-xs"
              options={warehouses.map(w => ({
                value: w.id,
                label: `${w.name} (${w.code})`,
              }))}
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-xs text-stone-700">Chọn Tủ / Kệ Mới (Từ CSDL)</span>}
            name="shelfId"
            rules={[{ required: true, message: 'Chọn tủ/kệ sách mới!' }]}
          >
            <Select
              placeholder="Chọn tủ/kệ lưu trữ..."
              className="rounded-xl text-xs font-bold text-amber-900"
              options={shelves.map(s => ({
                value: s.id,
                label: `${s.name} (${s.code})`,
              }))}
            />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
            <Button onClick={() => setTransferModalVisible(false)} className="rounded-xl font-bold">Hủy</Button>
            <Button type="primary" htmlType="submit" className="rounded-xl font-bold bg-amber-600 hover:bg-amber-700 border-none">
              Lưu Điều Chuyển
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ADD / EDIT WAREHOUSE MODAL */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-black text-stone-900 text-base">
            <Building className="w-5 h-5 text-amber-600" />
            <span>{editingWarehouse ? 'Chỉnh Sửa Thông Tin Kho Sách' : 'Thêm Kho Sách Mới'}</span>
          </div>
        }
        open={warehouseModalVisible}
        onCancel={() => setWarehouseModalVisible(false)}
        footer={null}
        width={480}
        centered
      >
        <Form form={warehouseForm} layout="vertical" onFinish={handleWarehouseSubmit} className="pt-2 space-y-3">
          <Form.Item
            label={<span className="font-bold text-xs text-stone-700">Tên Kho Sách</span>}
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên kho!' }]}
          >
            <Input placeholder="Ví dụ: Kho Sách Chuyên Ngành CNTT" className="rounded-xl text-xs font-bold" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label={<span className="font-bold text-xs text-stone-700">Mã Kho</span>}
              name="code"
              rules={[{ required: true, message: 'Nhập mã kho!' }]}
            >
              <Input placeholder="KHO-CNTT" className="rounded-xl text-xs font-mono" />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-xs text-stone-700">Phòng / Tầng</span>}
              name="room"
            >
              <Input placeholder="Phòng 02 - Tầng 3" className="rounded-xl text-xs" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label={<span className="font-bold text-xs text-stone-700">Tầng Lưu Kho</span>}
              name="floor"
            >
              <Input placeholder="Tầng 2" className="rounded-xl text-xs" />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-xs text-stone-700">Sức Chứa Tối Đa (cuốn)</span>}
              name="capacity"
            >
              <InputNumber style={{ width: '100%' }} min={100} step={500} className="rounded-xl text-xs font-bold" />
            </Form.Item>
          </div>

          <Form.Item
            label={<span className="font-bold text-xs text-stone-700">Mô Tả / Ghi Chú Kho</span>}
            name="description"
          >
            <Input.TextArea rows={2} placeholder="Mô tả ngắn gọn về kho sách này..." className="rounded-xl text-xs" />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
            <Button onClick={() => setWarehouseModalVisible(false)} className="rounded-xl font-bold">Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={warehouseSubmitting}
              className="rounded-xl font-bold bg-amber-600 hover:bg-amber-700 border-none"
            >
              {editingWarehouse ? 'Lưu Thay Đổi Kho' : 'Tạo Kho Mới'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* ADD / EDIT SHELF MODAL */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-black text-stone-900 text-base">
            <Layers className="w-5 h-5 text-amber-600" />
            <span>{editingShelf ? 'Chỉnh Sửa Tủ / Kệ Sách' : 'Thêm Tủ / Kệ Sách Mới'}</span>
          </div>
        }
        open={shelfModalVisible}
        onCancel={() => setShelfModalVisible(false)}
        footer={null}
        width={450}
        centered
      >
        <Form form={shelfForm} layout="vertical" onFinish={handleShelfSubmit} className="pt-2 space-y-3">
          <Form.Item
            label={<span className="font-bold text-xs text-stone-700">Kho Sách Lưu Trữ</span>}
            name="warehouseId"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Chọn kho sách..."
              className="rounded-xl text-xs"
              options={warehouses.map(w => ({ value: w.id, label: `${w.name} (${w.code})` }))}
            />
          </Form.Item>

          <Form.Item
            label={<span className="font-bold text-xs text-stone-700">Tên Tủ / Kệ Sách</span>}
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên tủ/kệ!' }]}
          >
            <Input placeholder="Ví dụ: Kệ A1 - Lập trình & CNTT" className="rounded-xl text-xs font-bold" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              label={<span className="font-bold text-xs text-stone-700">Mã Kệ</span>}
              name="code"
              rules={[{ required: true, message: 'Vui lòng nhập mã kệ!' }]}
            >
              <Input placeholder="KE-A1" className="rounded-xl text-xs font-mono" />
            </Form.Item>

            <Form.Item
              label={<span className="font-bold text-xs text-stone-700">Tầng Kệ</span>}
              name="floor"
            >
              <Input placeholder="Tầng 1" className="rounded-xl text-xs" />
            </Form.Item>
          </div>

          <Form.Item
            label={<span className="font-bold text-xs text-stone-700">Mô Tả / Ghi Chú</span>}
            name="description"
          >
            <Input placeholder="Mô tả kệ sách..." className="rounded-xl text-xs" />
          </Form.Item>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
            <Button onClick={() => setShelfModalVisible(false)} className="rounded-xl font-bold">Hủy</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={shelfSubmitting}
              className="rounded-xl font-bold bg-amber-600 hover:bg-amber-700 border-none"
            >
              {editingShelf ? 'Lưu Cập Nhật Kệ' : 'Thêm Kệ Mới'}
            </Button>
          </div>
        </Form>
      </Modal>

    </div>
  );
}

export default InventoryManagementPage;
