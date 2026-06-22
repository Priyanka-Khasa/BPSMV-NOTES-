import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/me`);
      setUser(res.data);
      return res.data;
    } catch {
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
    const res = await axios.post(`${API_URL}/auth/login`, { email, password });
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (name, email, password) => {
    const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    await axios.post(`${API_URL}/auth/logout`);
    setUser(null);
    window.location.href = '/';
  };

  const guestLogin = async () => {
    const ts = Date.now();
    const guestName = 'Guest Student';
    const guestEmail = `guest-${ts}@bpsmv.local`;
    const guestPassword = 'guest123';

    await register(guestName, guestEmail, guestPassword);
    await onboard({ degree: 'B.Tech', branch: 'CSE', yearOfStudy: 1, semester: 1 });
    return user;
  };
  const googleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const updateProfile = async (data) => {
    const res = await axios.put(`${API_URL}/auth/profile`, data);
    setUser(res.data);
    return res.data;
  };

  const onboard = async (data) => {
    const res = await axios.post(`${API_URL}/auth/onboard`, data);
    setUser(res.data);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, googleLogin, guestLogin, updateProfile, onboard, fetchUser, isAuthenticated: !!user, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
