import axiosInstance from './axiosInstance';

export const getAllDigitalDocsAdminApi = async (params = {}) => {
    return await axiosInstance.get('/api/digital-docs/admin', { params });
};

export const createDigitalDocAdminApi = async (data) => {
    return await axiosInstance.post('/api/digital-docs/admin', data);
};

export const updateDigitalDocAdminApi = async (id, data) => {
    return await axiosInstance.put(`/api/digital-docs/admin/${id}`, data);
};

export const deleteDigitalDocAdminApi = async (id) => {
    return await axiosInstance.delete(`/api/digital-docs/admin/${id}`);
};

export const toggleStatusDigitalDocAdminApi = async (id) => {
    return await axiosInstance.patch(`/api/digital-docs/admin/${id}/toggle-status`);
};

export const uploadFileAdminApi = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await axiosInstance.post('/api/digital-docs/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

