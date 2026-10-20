import axiosInstance from './axiosInstance';

export const registerApi = async ({ fullName, email, password, phone }) => {
  return await axiosInstance.post('/api/users/register', {
    fullName,
    email,
    password,
    phone: phone || '',
  });
};

export const loginApi = async ({ email, password }) => {
  return await axiosInstance.post('/api/users/login', {
    email,
    password,
  });
};

export const logoutApi = async () => {
  return await axiosInstance.post('/api/users/logout');
};

export const getCurrentUserApi = async () => {
  return await axiosInstance.get('/api/users/auth');
};

export const refreshTokenApi = async () => {
  return await axiosInstance.get('/api/users/refresh-token');
};

export const loginGoogleApi = async (credential) => {
  return await axiosInstance.post('/api/users/login-google', { credential });
};

export const forgotPasswordApi = async (email) => {
  return await axiosInstance.post('/api/users/forgot-password', { email });
};

export const resetPasswordApi = async ({ email, otp, newPassword }) => {
  return await axiosInstance.post('/api/users/reset-password', {
    email,
    otp,
    newPassword,
  });
};

export const changePasswordApi = async ({ currentPassword, newPassword }) => {
  return await axiosInstance.post('/api/users/change-password', {
    currentPassword,
    newPassword,
  });
};

export const updateProfileApi = async (profileData) => {
  return await axiosInstance.put('/api/users/update', profileData);
};
