import axiosInstance from './axiosInstance';

export const sendTestEmailApi = ({ templateType, targetEmail }) => {
    return axiosInstance.post('/api/emails/test-send', { templateType, targetEmail });
};
