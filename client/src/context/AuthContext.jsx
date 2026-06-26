import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

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

  const login = async (email, password) => {
    const res = await axios.post('/auth/login', { email, password });
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (name, email, password) => {
    const res = await axios.post('/auth/register', { name, email, password });
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err.message);
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  const guestLogin = async () => {
    const res = await axios.post('/auth/guest');
    setUser(res.data.user);
    return res.data.user;
  };

  const googleLogin = () => {
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
      guestLogin,
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
