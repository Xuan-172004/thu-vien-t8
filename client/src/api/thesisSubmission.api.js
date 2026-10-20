import axiosInstance from './axiosInstance';

// 1. Sinh viên upload file PDF đồ án
export const uploadThesisPdfApi = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await axiosInstance.post('/api/thesis-submissions/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 2. Sinh viên gửi hồ sơ nộp đồ án / luận văn
export const submitThesisApi = async (data) => {
  return await axiosInstance.post('/api/thesis-submissions/submit', data);
};

// 3. Sinh viên lấy danh sách đồ án đã nộp
export const getMyThesesApi = async () => {
  return await axiosInstance.get('/api/thesis-submissions/my-submissions');
};

// 4. Sinh viên nộp lại hồ sơ sau khi chỉnh sửa
export const resubmitThesisApi = async (id, data) => {
  return await axiosInstance.put(`/api/thesis-submissions/resubmit/${id}`, data);
};

// 5. Admin lấy danh sách hồ sơ cần duyệt
export const getSubmissionsAdminApi = async (params = {}) => {
  return await axiosInstance.get('/api/thesis-submissions/admin/list', { params });
};

// 6. Admin xem chi tiết 1 hồ sơ
export const getSubmissionDetailAdminApi = async (id) => {
  return await axiosInstance.get(`/api/thesis-submissions/admin/${id}`);
};

// 7. Admin phê duyệt hồ sơ & xuất bản lên kho tài liệu số
export const approveSubmissionAdminApi = async (id, config) => {
  return await axiosInstance.post(`/api/thesis-submissions/admin/${id}/approve`, config);
};

// 8. Admin từ chối hồ sơ
export const rejectSubmissionAdminApi = async (id, { rejectReason }) => {
  return await axiosInstance.post(`/api/thesis-submissions/admin/${id}/reject`, { rejectReason });
};
