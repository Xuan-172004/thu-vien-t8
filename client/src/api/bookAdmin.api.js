import axiosInstance from './axiosInstance';

export const getAllBooksPublicApi = async (params = {}) => {
  return await axiosInstance.get('/api/books', { params });
};

export const getCategoriesPublicApi = async () => {
  return await axiosInstance.get('/api/books/categories');
};

export const getAllBooksAdminApi = async (params = {}) => {
  return await axiosInstance.get('/api/books/admin/list', { params });
};

export const createBookApi = async (bookData) => {
  return await axiosInstance.post('/api/books', bookData);
};

export const updateBookApi = async (bookId, bookData) => {
  return await axiosInstance.put(`/api/books/${bookId}`, bookData);
};

export const deleteBookApi = async (bookId) => {
  return await axiosInstance.delete(`/api/books/${bookId}`);
};

export const toggleBookVisibilityApi = async (bookId) => {
  return await axiosInstance.put(`/api/books/visibility/${bookId}`);
};

export const getCategoriesAdminApi = async () => {
  return await axiosInstance.get('/api/books/categories');
};

export const createCategoryApi = async (catData) => {
  return await axiosInstance.post('/api/books/categories', catData);
};

export const updateCategoryApi = async (catId, catData) => {
  return await axiosInstance.put(`/api/books/categories/${catId}`, catData);
};

export const deleteCategoryApi = async (catId) => {
  return await axiosInstance.delete(`/api/books/categories/${catId}`);
};

export const uploadCategoryImageApi = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await axiosInstance.post('/api/books/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const uploadBookImagesApi = async (files) => {
  const formData = new FormData();
  if (Array.isArray(files)) {
    files.forEach((file) => formData.append('files', file));
  } else if (files instanceof FileList) {
    Array.from(files).forEach((file) => formData.append('files', file));
  } else {
    formData.append('file', files);
  }
  return await axiosInstance.post('/api/books/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const seedLibraryDataApi = async () => {
  return await axiosInstance.post('/api/books/admin/seed-library-data');
};

