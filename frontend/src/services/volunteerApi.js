// src/services/volunteerApi.js
import api from './api';

const authAPI = {
  // Register new volunteer
  register: async (data) => {
    try {
      const response = await api.post('/volunteers/register/', data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      
      // Return detailed error information
      if (error.response?.data) {
        return {
          success: false,
          error: error.response.data.error || 'Registration failed',
          errors: error.response.data.errors || null,
          response: error.response
        };
      }
      
      return {
        success: false,
        error: error.message || 'Registration failed',
      };
    }
  },

  // Login
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login/', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('volunteer', JSON.stringify(response.data.volunteer));
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  },

  // Logout
  logout: async () => {
    try {
      const refresh = localStorage.getItem('refresh');
      if (refresh) {
        await api.post('/auth/logout/', { refresh });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refresh');
      localStorage.removeItem('volunteer');
    }
  },

  // Get volunteer profile
  getProfile: async () => {
    try {
      const response = await api.get('/volunteers/profile/');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch profile',
      };
    }
  },

  // Update volunteer profile
  updateProfile: async (data) => {
    try {
      const response = await api.patch('/volunteers/profile/', data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update profile',
      };
    }
  },

  // Get volunteer history
  getHistory: async (params = {}) => {
    try {
      const response = await api.get('/volunteers/history/', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch history',
      };
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await api.post('/volunteers/change-password/', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to change password',
      };
    }
  },

  // Register for event
  registerForEvent: async (eventId, data) => {
    try {
      const response = await api.post(`/events/${eventId}/register/`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to register for event',
      };
    }
  },

  // Get joined events
  getJoinedEvents: async (volunteerId) => {
    try {
      const response = await api.get(`/volunteers/${volunteerId}/events/`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch events',
      };
    }
  },
};

export default authAPI;