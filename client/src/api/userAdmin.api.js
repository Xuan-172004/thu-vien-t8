import axiosInstance from './axiosInstance';

export const getAllUsersApi = async () => {
  return await axiosInstance.get('/api/users/admin/users');
};

export const toggleLockUserApi = async (userId) => {
  return await axiosInstance.put(`/api/users/admin/users/lock/${userId}`);
};

export const updateUserAdminApi = async (userId, userData) => {
  return await axiosInstance.put(`/api/users/admin/users/${userId}`, userData);
};

export const deleteUserAdminApi = async (userId) => {
  return await axiosInstance.delete(`/api/users/admin/users/${userId}`);
};

export const createUserAdminApi = async (userData) => {
  return await axiosInstance.post('/api/users/admin/users', userData);
};
