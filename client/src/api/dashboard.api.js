import axiosInstance from './axiosInstance';

export const getDashboardOverviewApi = () => {
    return axiosInstance.get('/api/dashboard/overview');
};

export const getDashboardChartsApi = (params = {}) => {
    return axiosInstance.get('/api/dashboard/charts', { params });
};

export const getDashboardExportDataApi = () => {
    return axiosInstance.get('/api/dashboard/export');
};
