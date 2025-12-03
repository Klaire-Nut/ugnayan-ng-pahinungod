// src/services/volunteerApi.js

import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

// Create a single axios instance for ALL volunteer requests
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,  // CRITICAL: Must be true for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔥 DEBUGGING: Log all requests to see what's happening
api.interceptors.request.use(
  (config) => {
    console.log("🚀 REQUEST:", config.method.toUpperCase(), config.url);
    console.log("📦 Cookies being sent:", document.cookie);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🔥 DEBUGGING: Log all responses
api.interceptors.response.use(
  (response) => {
    console.log("✅ RESPONSE:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.log("❌ ERROR:", error.response?.status, error.config?.url);
    console.log("❌ ERROR DATA:", error.response?.data);
    return Promise.reject(error);
  }
);

export const volunteerAPI = {
  // -----------------------------
  // REGISTER VOLUNTEER
  // -----------------------------
  register: async (data) => {
    try {
      const response = await api.post("/volunteers/register/", data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Registration failed",
        errors: error.response?.data?.errors || null,
      };
    }
  },

  // -----------------------------
  // LOGIN (SESSION LOGIN)
  // -----------------------------
  login: async (email, password) => {
    try {
      console.log("🔐 Attempting login with:", email);
      
      const response = await api.post(
        "/volunteers/login/",
        { email, password }
      );

      console.log("✅ LOGIN SUCCESS:", response.data);
      console.log("🍪 Cookies after login:", document.cookie);

      return { success: true, data: response.data };
    } catch (error) {
      console.error("❌ LOGIN ERROR:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  },

  // -----------------------------
  // LOGOUT
  // -----------------------------
  logout: async () => {
    try {
      await api.post("/volunteers/logout/");
      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  },

  // -----------------------------
  // GET PROFILE (SESSION REQUIRED)
  // -----------------------------
  getProfile: async () => {
    try {
      console.log("👤 Fetching profile...");
      console.log("🍪 Cookies before profile fetch:", document.cookie);
      
      const response = await api.get("/volunteers/profile/");

      console.log("✅ PROFILE GET SUCCESS:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("❌ PROFILE GET ERROR:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to fetch profile",
      };
    }
  },

  // -----------------------------
// UPDATE PROFILE (PATCH)
// -----------------------------
updateProfile: async (data) => {
  console.log("📝 PATCH DATA SENT:", data);

  try {
    const response = await api.patch("/volunteers/profile/", data, {
      withCredentials: true,  // ⭐ REQUIRED for PATCH
    });

    console.log("✅ PATCH RESPONSE:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ PROFILE UPDATE ERROR:", error.response?.data);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to update profile",
    };
  }
},


  // -----------------------------
  // EVENT HISTORY
  // -----------------------------
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

  // -----------------------------
  // CHANGE PASSWORD
  // -----------------------------
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

  // -----------------------------
  // REGISTER FOR EVENT
  // -----------------------------
  registerForEvent: async (eventId, data) => {
    try {
      const response = await api.post(`/events/${eventId}/register/`, data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to register for event",
      };
    }
  },

  // -----------------------------
  // GET JOINED EVENTS
  // -----------------------------
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