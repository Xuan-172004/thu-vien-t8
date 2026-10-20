import axiosInstance from './axiosInstance';

export const uploadCardAvatarApi = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return await axiosInstance.post('/api/cards/upload-avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const registerCardApi = async (cardData) => {
  return await axiosInstance.post('/api/cards/register', cardData);
};

export const cancelCardApi = async () => {
  return await axiosInstance.delete('/api/cards/cancel');
};

export const getMyCardApi = async () => {
  return await axiosInstance.get('/api/cards/my-card');
};

export const getAllCardsAdminApi = async () => {
  return await axiosInstance.get('/api/cards/admin/list');
};

export const approveCardAdminApi = async (userId, data) => {
  return await axiosInstance.put(`/api/cards/admin/approve/${userId}`, data);
};

export const rejectCardAdminApi = async (userId, data) => {
  return await axiosInstance.put(`/api/cards/admin/reject/${userId}`, data);
};

export const updateCardStatusAdminApi = async (userId, data) => {
  return await axiosInstance.put(`/api/cards/admin/status/${userId}`, data);
};
