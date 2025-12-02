// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, volunteerAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('volunteer');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('volunteer');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authAPI.login(email, password);
      
      // Store token and user data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('volunteer', JSON.stringify(data.volunteer));
      setUser(data.volunteer);
      
      return { success: true, data };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.detail || 'Login failed' 
      };
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  const register = async (volunteerData) => {
    try {
      const result = await authAPI.register(volunteerData);
      return result; // Already has { success, data/error } format
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const updateUser = async () => {
    try {
      const profile = await volunteerAPI.getProfile();
      setUser(profile);
      localStorage.setItem('volunteer', JSON.stringify(profile));
      return { success: true, data: profile };
    } catch (error) {
      console.error('Failed to update user:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update user' 
      };
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    loading,
    updateUser,
    isAuthenticated: !!user,
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
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};