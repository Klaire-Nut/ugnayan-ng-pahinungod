// src/services/volunteerApi.js
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

// ========================================
// CREATE AXIOS INSTANCE FIRST (IMPORTANT)
// ========================================
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ========================================
// ADD TOKEN TO EVERY REQUEST
// ========================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("volunteerToken");

    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }

    console.log("🚀 REQUEST:", config.method.toUpperCase(), config.url);
    console.log("🔐 Auth Header:", config.headers.Authorization || "None");
    return config;
  },
  (error) => Promise.reject(error)
);

// ========================================
// LOG RESPONSES
// ========================================
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

// ========================================
// VOLUNTEER API METHODS
// ========================================
export const volunteerAPI = {
  // -----------------------------
  // REGISTER
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
  // LOGIN (Token-Based)
  // -----------------------------
  login: async (email, password) => {
    try {
      console.log("🔐 Attempting login with:", email);

      const response = await api.post("/volunteers/login/", { email, password });

      console.log("✅ LOGIN SUCCESS:", response.data);

      // ⭐ STORE TOKEN
      if (response.data.token) {
        localStorage.setItem("volunteerToken", response.data.token);
        console.log("🔐 STORED TOKEN:", response.data.token);
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

  // -----------------------------
  // LOGOUT
  // -----------------------------
  logout: async () => {
    try {
      await api.post("/volunteers/logout/");
      localStorage.removeItem("volunteerToken"); // remove token
      console.log("✅ Logout successful");
    } catch (error) {
      console.error("❌ Logout error:", error);
    }
  },

  // -----------------------------
  // GET PROFILE (TOKEN REQUIRED)
  // -----------------------------
  getProfile: async () => {
    try {
      console.log("👤 Fetching profile...");
      
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
  // UPDATE PROFILE
  // -----------------------------
  updateProfile: async (data) => {
    console.log("📝 PATCH DATA SENT:", data);
    try {
      const response = await api.patch("/volunteers/profile/", data);
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
  // GET EVENT HISTORY
  // -----------------------------
  getHistory: async () => {
    try {
      const response = await api.get("/volunteers/history/");
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
};
