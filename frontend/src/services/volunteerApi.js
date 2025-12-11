// src/services/volunteerApi.js
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

// ------------------------------------------------------
// Create axios instance
// ------------------------------------------------------
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ------------------------------------------------------
// Automatically attach token
// ------------------------------------------------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("volunteerToken");

    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }

    console.log("➡️ REQUEST:", config.method.toUpperCase(), config.url);
    console.log("🔐 TOKEN:", token ? "Attached" : "None");
    return config;
  },
  (error) => Promise.reject(error)
);

// ------------------------------------------------------
// Log responses
// ------------------------------------------------------
api.interceptors.response.use(
  (response) => {
    console.log("✅ RESPONSE:", response.status, response.config.url);
    return response;
  },
  (error) => {
    console.log("❌ RESPONSE ERROR:", error.response?.status, error.config?.url);
    console.log("❌ ERROR BODY:", error.response?.data);
    return Promise.reject(error);
  }
);

// ------------------------------------------------------
// API FUNCTIONS
// ------------------------------------------------------
export const volunteerAPI = {
  // -----------------------------------------------
  // REGISTER
  // -----------------------------------------------
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

  // -----------------------------------------------
  // LOGIN (matches backend /volunteer/login/)
  // -----------------------------------------------
  login: async (email, password) => {
    try {
      console.log("🔐 Attempting volunteer login:", email);

      const response = await api.post("/volunteers/login/", { email, password });

      console.log("✅ LOGIN SUCCESS:", response.data);

      if (response.data.token) {
        localStorage.setItem("volunteerToken", response.data.token);
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.error("❌ LOGIN ERROR:", error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || "Login failed",
      };
    }
  },

  // -----------------------------------------------
  // LOGOUT
  // -----------------------------------------------
  logout: async () => {
    try {
      await api.post("/volunteers/logout/");
      localStorage.removeItem("volunteerToken");
      console.log("🔓 Logged out.");
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  },

  // -----------------------------------------------
  // GET PROFILE
  // -----------------------------------------------
  getProfile: async () => {
    try {
      const response = await api.get("/volunteers/profile/");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to load profile",
      };
    }
  },

  // -----------------------------------------------
  // UPDATE PROFILE
  // -----------------------------------------------
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

  // -----------------------------------------------
  // EVENT HISTORY
  // -----------------------------------------------
  getHistory: async () => {
    try {
      const response = await api.get("/volunteers/history/");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to load history",
      };
    }
  },

  // -----------------------------------------------
  // CHANGE PASSWORD
  // -----------------------------------------------
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
};


volunteerAPI.joinEvent = async (eventId, scheduleIds) => {
  try {
    const response = await api.post("/volunteer/events/join/", {
      event: eventId,
      schedules: scheduleIds,
    });

    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || "Failed to join event",
    };
  }
};