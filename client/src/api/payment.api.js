import axiosInstance from './axiosInstance';

export const createDepositApi = async (data) => {
  return await axiosInstance.post('/api/payment/deposit', data);
};

export const getDepositHistoryApi = async (params = {}) => {
  return await axiosInstance.get('/api/payment/history', { params });
};
