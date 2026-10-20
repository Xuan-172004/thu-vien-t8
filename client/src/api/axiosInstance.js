import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true, // Send httpOnly cookies (refreshToken)
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Access Token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized & Auto Refresh Token
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data; // Return clean data directly
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error status is 401 (Unauthorized / Token Expired) and not retried yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      
      // Do not attempt refresh on auth routes like login/register/logout to avoid infinite loops
      if (
        originalRequest.url.includes('/api/users/login') ||
        originalRequest.url.includes('/api/users/register') ||
        originalRequest.url.includes('/api/users/refresh-token')
      ) {
        return Promise.reject(error.response?.data || error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        
        // Call refresh token API
        const res = await axios.get(`${API_URL}/api/users/refresh-token`, {
          withCredentials: true,
          headers: storedRefreshToken ? { Authorization: `Bearer ${storedRefreshToken}` } : {},
        });

        const newToken = res.data?.metadata?.token || res.data?.token;

        if (newToken) {
          localStorage.setItem('token', newToken);
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          processQueue(null, newToken);
          isRefreshing = false;

          return axiosInstance(originalRequest);
        } else {
          throw new Error('Refresh token failed');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        isRefreshing = false;

        // Clear expired auth session and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        if (window.location.pathname !== '/auth') {
          window.location.href = '/auth';
        }

        return Promise.reject(refreshErr.response?.data || refreshErr);
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default axiosInstance;
