import axiosInstance from './axiosInstance';

export const getAllCopiesApi = async (params = {}) => {
  return await axiosInstance.get('/api/copies', { params });
};

export const batchCreateCopiesApi = async (data) => {
  return await axiosInstance.post('/api/copies/batch-create', data);
};

export const transferCopyApi = async (copyId, data) => {
  return await axiosInstance.put(`/api/copies/transfer/${copyId}`, data);
};

export const updateCopyConditionApi = async (copyId, data) => {
  return await axiosInstance.put(`/api/copies/condition/${copyId}`, data);
};

export const deleteCopyApi = async (copyId) => {
  return await axiosInstance.delete(`/api/copies/${copyId}`);
};

export const getAllWarehousesApi = async () => {
  return await axiosInstance.get('/api/copies/warehouses');
};

export const createWarehouseApi = async (data) => {
  return await axiosInstance.post('/api/copies/warehouses', data);
};

export const updateWarehouseApi = async (id, data) => {
  return await axiosInstance.put(`/api/copies/warehouses/${id}`, data);
};

export const deleteWarehouseApi = async (id) => {
  return await axiosInstance.delete(`/api/copies/warehouses/${id}`);
};

export const getAllShelvesApi = async (warehouseId) => {
  return await axiosInstance.get('/api/copies/shelves', { params: { warehouseId } });
};

export const createShelfApi = async (data) => {
  return await axiosInstance.post('/api/copies/shelves', data);
};

export const updateShelfApi = async (id, data) => {
  return await axiosInstance.put(`/api/copies/shelves/${id}`, data);
};

export const deleteShelfApi = async (id) => {
  return await axiosInstance.delete(`/api/copies/shelves/${id}`);
};
