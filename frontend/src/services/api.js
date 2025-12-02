// src/services/api.js - Main API configuration
import axios from "axios";

// ==================== BASE CONFIGURATION ====================
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Create axios instance with default base URL & headers
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==================== REQUEST INTERCEPTOR ====================
// Automatically attach Authorization header with token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // ✅ Added token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Bearer token auth
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==================== RESPONSE INTERCEPTOR ====================
// Centralized error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Auto logout on 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('volunteer');
      window.location.href = '/login'; // redirect to login
    }

    // Pass backend error directly
    if (error.response?.data) {
      return Promise.reject(error);
    }

    // Handle network errors
    if (error.message === "Network Error") {
      return Promise.reject({ 
        response: { 
          data: { error: "Unable to reach server. Please try again." } 
        } 
      });
    }

    // Unexpected error
    return Promise.reject({ 
      response: { 
        data: { error: error.message || "Something went wrong." } 
      } 
    });
  }
);

// ==================== AUTH API ====================
// Handles both admin and volunteer login + registration
export const authAPI = {
  adminLogin: async (email, password) => {
    try {
      const response = await api.post("/auth/login/", { email, password });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Admin login failed",
      };
    }
  },

  volunteerLogin: async (email, password) => {
    try {
      const response = await api.post("/auth/volunteer/login/", { email, password });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Volunteer login failed",
      };
    }
  },

  register: async (registrationData) => {
    try {
      const response = await api.post("/volunteers/register/", registrationData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Registration failed",
      };
    }
  }
};

// ==================== VOLUNTEER API ====================
// Volunteer profile management
export const volunteerAPI = {
  getProfile: async () => {
    const response = await api.get("/volunteers/profile/");
    return response.data;
  },

  updateProfile: async (updateData) => {
    const response = await api.patch("/volunteers/profile/update/", updateData);
    return response.data;
  },

  getVolunteers: async () => {
    const response = await api.get("/volunteers/list/");
    return response.data;
  },

  getVolunteer: async (email) => {
    const response = await api.get(`/volunteers/${email}/`);
    return response.data;
  },

  updateVolunteer: async (email, updateData) => {
    const response = await api.patch(`/volunteers/${email}/update/`, updateData);
    return response.data;
  }
};

// ==================== EVENTS API ====================
// Handles public, volunteer, and admin endpoints
export const eventsAPI = {
  // ----- PUBLIC EVENTS -----
  getPublicEvents: async (params = {}) => {
    const response = await api.get('/events/', { params }); // direct /events/
    return response.data;
  },

  getPublicEventDetail: async (eventId) => {
    const response = await api.get(`/events/${eventId}/`);
    return response.data;
  },

  // ----- VOLUNTEER EVENTS -----
  // ✅ Corrected paths to match urls.py:
  // /api/events/volunteer/events/
  getVolunteerEvents: async (params = {}) => {
    const response = await api.get('/events/volunteer/events/', { params });
    return response.data;
  },

  getVolunteerEventDetail: async (eventId) => {
    const response = await api.get(`/events/volunteer/events/${eventId}/`);
    return response.data;
  },

  joinEvent: async (eventData) => {
    const response = await api.post('/events/volunteer/events/join/', eventData);
    return response.data;
  },

  getMyEvents: async (params = {}) => {
    const response = await api.get('/events/volunteer/my-events/', { params });
    return response.data;
  },

  dropEvent: async (eventId) => {
    const response = await api.post(`/events/volunteer/events/${eventId}/drop/`);
    return response.data;
  },

  updateAvailability: async (eventId, availabilityData) => {
    const response = await api.patch(
      `/events/volunteer/events/${eventId}/availability/`, 
      availabilityData
    );
    return response.data;
  },

  // ----- ADMIN EVENTS -----
  adminGetEvents: async (params = {}) => {
    const response = await api.get('/events/admin/events/', { params });
    return response.data;
  },

  adminCreateEvent: async (eventData) => {
    const response = await api.post('/events/admin/events/', eventData);
    return response.data;
  },

  adminGetEventDetail: async (eventId) => {
    const response = await api.get(`/events/admin/events/${eventId}/`);
    return response.data;
  },

  adminUpdateEvent: async (eventId, eventData) => {
    const response = await api.put(`/events/admin/events/${eventId}/`, eventData);
    return response.data;
  },

  adminPartialUpdateEvent: async (eventId, eventData) => {
    const response = await api.patch(`/events/admin/events/${eventId}/`, eventData);
    return response.data;
  },

  adminCancelEvent: async (eventId) => {
    const response = await api.post(`/events/admin/events/${eventId}/cancel/`);
    return response.data;
  },

  adminDeleteEvent: async (eventId) => {
    const response = await api.delete(`/events/admin/events/${eventId}/`);
    return response.data;
  },

  adminGetEventVolunteers: async (eventId) => {
    const response = await api.get(`/events/admin/events/${eventId}/volunteers/`);
    return response.data;
  },

  adminUpdateVolunteerEvent: async (eventId, volunteerId, data) => {
    const response = await api.patch(
      `/events/admin/events/${eventId}/volunteers/${volunteerId}/`, 
      data
    );
    return response.data;
  },

  adminGetEventStats: async (eventId) => {
    const response = await api.get(`/events/admin/events/${eventId}/stats/`);
    return response.data;
  }
};

// Export axios instance for custom requests if needed
export default api;
