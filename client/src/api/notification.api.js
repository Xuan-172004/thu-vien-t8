import axiosInstance from './axiosInstance';

export const getMyNotificationsApi = (params = {}) => {
    return axiosInstance.get('/api/notifications', { params });
};

export const getUnreadCountApi = () => {
    return axiosInstance.get('/api/notifications/unread-count');
};

export const markAsReadApi = (id) => {
    return axiosInstance.patch(`/api/notifications/${id}/read`);
};

export const markAllAsReadApi = () => {
    return axiosInstance.patch('/api/notifications/read-all');
};

export const deleteNotificationApi = (id) => {
    return axiosInstance.delete(`/api/notifications/${id}`);
};

export const sendTestNotificationApi = (data) => {
    return axiosInstance.post('/api/notifications/test-send', data);
};
