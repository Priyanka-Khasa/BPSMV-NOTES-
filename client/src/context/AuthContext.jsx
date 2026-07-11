import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const normalizeApiBase = (value) => {
  const trimmed = (value || '/api').trim();
  if (!trimmed || trimmed === '/api') return '/api';

  const withoutTrailingSlash = trimmed.replace(/\/+$/, '');
  return withoutTrailingSlash.endsWith('/api')
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`;
};

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

// Configure axios defaults globally
axios.defaults.baseURL = API_BASE;
axios.defaults.withCredentials = true;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/auth/me');
      setUser(res.data);
      return res.data;
    } catch (err) {
      if (err.response?.status !== 401) {
        console.error('Auth check error:', err.message);
      }
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (err) => {
        const message = err.response?.data?.message || '';
        const signedInElsewhere = err.response?.status === 401 && message.includes('active on another device');
        if (signedInElsewhere) {
          setUser(null);
          if (window.location.pathname !== '/login') {
            window.location.href = '/login?session=ended';
          }
        }
        if (err.response?.status === 402 && window.location.pathname !== '/subscribe') {
          window.location.href = user?.onboarded === false ? '/onboarding' : '/subscribe';
        }
        return Promise.reject(err);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [user?.onboarded]);

  const login = async (email, password) => {
    setUser(null);
    const res = await axios.post('/auth/login', { email, password });
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (name, email, password, rollNumber) => {
    setUser(null);
    const res = await axios.post('/auth/register', { name, email, password, rollNumber });
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    setUser(null);
    try {
      await axios.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err.message);
    } finally {
      setUser(null);
      window.location.replace('/login');
    }
  };

  const googleLogin = () => {
    setUser(null);
    window.location.href = `${API_BASE}/auth/google`;
  };

  const updateProfile = async (data) => {
    const res = await axios.put('/auth/profile', data);
    setUser(res.data);
    return res.data;
  };

  const onboard = async (data) => {
    const res = await axios.post('/auth/onboard', data);
    setUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      loading,
      login,
      register,
      logout,
      googleLogin,
      updateProfile,
      onboard,
      fetchUser,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
