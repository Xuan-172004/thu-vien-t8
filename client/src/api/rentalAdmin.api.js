import axiosInstance from './axiosInstance';

export const getAdminRentalOrdersApi = async (params = {}) => {
  return await axiosInstance.get('/api/rentals/admin/list', { params });
};

export const createCounterOrderApi = async (data = {}) => {
  return await axiosInstance.post('/api/rentals/admin/create-counter', data);
};

export const approveRentalOrderApi = async (id, data = {}) => {
  return await axiosInstance.put(`/api/rentals/admin/approve/${id}`, data);
};

export const rejectRentalOrderApi = async (id, data = {}) => {
  return await axiosInstance.put(`/api/rentals/admin/reject/${id}`, data);
};

export const confirmHandoverApi = async (id) => {
  return await axiosInstance.put(`/api/rentals/admin/handover/${id}`);
};

export const processReturnApi = async (id, data = {}) => {
  return await axiosInstance.put(`/api/rentals/admin/return/${id}`, data);
};
