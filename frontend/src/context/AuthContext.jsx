import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('sms_token');
      const savedUser = localStorage.getItem('sms_user');
      
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem('sms_token');
          localStorage.removeItem('sms_user');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await API.post('/auth/login', { username, password });
      const { token, username: uName, email, role } = response.data;
      
      localStorage.setItem('sms_token', token);
      
      const userData = { username: uName, email, role };
      localStorage.setItem('sms_user', JSON.stringify(userData));
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      const message = error.response?.data?.message || "Invalid username or password";
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('sms_token');
    localStorage.removeItem('sms_user');
    setUser(null);
  };

  const updateProfileEmail = (newEmail) => {
    const updatedUser = { ...user, email: newEmail };
    localStorage.setItem('sms_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const isAdmin = () => user?.role === 'ADMIN';
  const isStaff = () => user?.role === 'STAFF' || user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isStaff, updateProfileEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
