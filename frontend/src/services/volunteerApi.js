// src/services/volunteerApi.js
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

// Axios instance for volunteer endpoints
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const volunteerAPI = {
  // Register new volunteer
  register: async (data) => {
    try {
      const response = await api.post("/volunteers/register/", data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Registration error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || "Registration failed",
        errors: error.response?.data?.errors || null,
      };
    }
  },

  // Login
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login/", { email, password });

      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("volunteer", JSON.stringify(response.data.volunteer));
      }

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post("/auth/logout/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("volunteer");
    }
  },

  // Get volunteer profile
  getProfile: async () => {
    try {
      const response = await api.get("/volunteers/profile/");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to fetch profile",
      };
    }
  },

  // Update volunteer profile
  updateProfile: async (data) => {
    try {
      const response = await api.patch("/volunteers/profile/", data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to update profile",
      };
    }
  },

  // Event history
  getHistory: async (params = {}) => {
    try {
      const response = await api.get("/volunteers/history/", { params });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to fetch history",
      };
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await api.post("/volunteers/change-password/", {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to change password",
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
        error:
          error.response?.data?.error || "Failed to register for event",
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
        error: error.response?.data?.error || "Failed to fetch events",
      };
    }
  },
};
