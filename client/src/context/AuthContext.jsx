import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';
import { 
  loginApi, 
  registerApi, 
  logoutApi, 
  getCurrentUserApi 
} from '../api/auth.api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Check auth session on load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await getCurrentUserApi();
          if (res?.metadata?.user) {
            setUser(res.metadata.user);
            localStorage.setItem('user', JSON.stringify(res.metadata.user));
          }
        } catch (err) {
          console.error('Failed to fetch user profile:', err);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await loginApi({ email, password });
      const { token, refreshToken, user: userData } = res.metadata || res;
      
      if (token) localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }

      message.success('Đăng nhập thành công!');
      return { success: true, user: userData };
    } catch (error) {
      const msg = error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!';
      message.error(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (fullName, email, password, phone) => {
    try {
      const res = await registerApi({ fullName, email, password, phone });
      const { token, refreshToken, user: userData } = res.metadata || res;

      if (token) localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }

      message.success('Tạo tài khoản thành công!');
      return { success: true, user: userData };
    } catch (error) {
      const msg = error.message || 'Đăng ký thất bại. Vui lòng thử lại!';
      message.error(msg);
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.warn('Logout API warning:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      message.info('Đã đăng xuất tài khoản.');
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
