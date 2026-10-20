import axiosInstance from './axiosInstance';

export const getAllArticlesPublicApi = (params = {}) => {
    return axiosInstance.get('/api/articles', { params });
};

export const getArticleDetailPublicApi = (slugOrId) => {
    return axiosInstance.get(`/api/articles/${slugOrId}`);
};

export const createArticleAdminApi = (data) => {
    return axiosInstance.post('/api/articles', data);
};

export const updateArticleAdminApi = (id, data) => {
    return axiosInstance.put(`/api/articles/${id}`, data);
};

export const deleteArticleAdminApi = (id) => {
    return axiosInstance.delete(`/api/articles/${id}`);
};

export const toggleArticleStatusAdminApi = (id) => {
    return axiosInstance.patch(`/api/articles/${id}/toggle-status`);
};
