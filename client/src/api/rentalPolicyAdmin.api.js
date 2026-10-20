import axiosInstance from './axiosInstance';

export const getAllPoliciesApi = async () => {
  return await axiosInstance.get('/api/policies');
};

export const getPolicyByIdApi = async (id) => {
  return await axiosInstance.get(`/api/policies/${id}`);
};

export const updatePolicyApi = async (id, data) => {
  return await axiosInstance.put(`/api/policies/${id}`, data);
};
