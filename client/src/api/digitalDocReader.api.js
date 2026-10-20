import axiosInstance from './axiosInstance';

export const getAllDigitalDocsPublicApi = async (params = {}) => {
    return await axiosInstance.get('/api/digital-docs/public', { params });
};

export const getPublicDigitalDocsApi = getAllDigitalDocsPublicApi;

export const getDigitalDocDetailPublicApi = async (id) => {
    return await axiosInstance.get(`/api/digital-docs/public/${id}`);
};

export const checkDigitalDocOwnershipApi = async (id) => {
    return await axiosInstance.get(`/api/digital-docs/check-ownership/${id}`);
};

export const purchaseDigitalDocApi = async (id, paymentMethod = 'wallet') => {
    try {
        const response = await axiosInstance.post(`/api/digital-docs/purchase/${id}`, { paymentMethod });
        return response;
    } catch (error) {
        const msg = error.response?.data?.message || error.message || 'Không thể thực hiện giao dịch mua!';
        throw new Error(msg);
    }
};

export const getMyPurchasedDigitalDocsApi = async () => {
    return await axiosInstance.get('/api/digital-docs/my-purchases');
};

