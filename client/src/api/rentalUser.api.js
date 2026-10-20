import axiosInstance from './axiosInstance';

export const createBorrowOrderApi = async (data) => {
  return await axiosInstance.post('/api/rentals', data);
};

export const getMyRentalOrdersApi = async (params = {}) => {
  return await axiosInstance.get('/api/rentals/my-rentals', { params });
};

export const requestExtensionApi = async (orderId) => {
  return await axiosInstance.post(`/api/rentals/extend/${orderId}`);
};

export const cancelBorrowOrderApi = async (orderId) => {
  return await axiosInstance.delete(`/api/rentals/cancel/${orderId}`);
};
