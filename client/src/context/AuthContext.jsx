import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

const AuthContext = createContext(null);

/* Fake user for development — auth bypassed */
const FAKE_USER = {
  _id: 'dev-user-001',
  name: 'Dev Student',
  email: 'dev@bpsmv.local',
  role: 'admin',
  degree: 'B.Tech',
  branch: 'CSE',
  yearOfStudy: 3,
  semester: 5,
  onboarded: true,
  avatar: 'https://ui-avatars.com/api/?name=Dev+Student&background=2563eb&color=fff'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(FAKE_USER);
  const [loading, setLoading] = useState(false);

  const fetchUser = async () => {
    /* Always resolve with fake user */
    setUser(FAKE_USER);
    setLoading(false);
    return FAKE_USER;
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async () => { setUser(FAKE_USER); return FAKE_USER; };
  const register = async () => { setUser(FAKE_USER); return FAKE_USER; };
  const logout = async () => { setUser(FAKE_USER); window.location.href = '/dashboard'; };
  const guestLogin = async () => { setUser(FAKE_USER); return FAKE_USER; };
  const googleLogin = () => { setUser(FAKE_USER); };
  const updateProfile = async (data) => { const updated = { ...FAKE_USER, ...data }; setUser(updated); return updated; };
  const onboard = async (data) => { const updated = { ...FAKE_USER, ...data, onboarded: true }; setUser(updated); return updated; };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      googleLogin,
      guestLogin,
      updateProfile,
      onboard,
      fetchUser,
      isAuthenticated: true,
      isAdmin: true
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
