import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/fetchApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // No global loading
  const [error, setError] = useState(null);

  // On mount, fetch the latest user profile (if logged in)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        setUser(res.data);
      } catch (e) {
        setUser(null);
      }
    };
    fetchProfile();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/auth/login', {
        email, password
      });
      if (!res.data || !res.data.user) throw new Error(res.data.message || 'Login failed');
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const register = async (name, email, password, username) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.post('/auth/register', {
        name, email, password, username
      });
      if (!res.data) throw new Error(res.data.message || 'Registration failed');
      return res.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    setUser, // <-- Add setUser to context value so it can be used in hooks
    loading,
    error,
    login,
    logout,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};