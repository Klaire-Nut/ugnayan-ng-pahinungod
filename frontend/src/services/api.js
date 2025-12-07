// src/services/api.js
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

// General axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 🔥 Required for Django session cookies
});

// Auth-specific axios instance
const authClient = axios.create({
  baseURL: `${API_BASE_URL}/auth/`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ================================
// 🔐 AUTH API (VOLUNTEER ONLY)
// ================================
export const authAPI = {
  // --- REGISTER VOLUNTEER ---
  register: async (data) => {
    try {
      const response = await authClient.post("register/", data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Register error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.errors || "Registration failed",
      };
    }
  },

  // --- LOGIN (VOLUNTEER ONLY) ---
  login: async ({ email, password }) => {
    try {
      const response = await authClient.post("volunteer/login/", {
        email,
        password,
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.detail ||
          "Login failed",
      };
    }
  },

  // --- LOGOUT VOLUNTEER ---
  logout: async () => {
    try {
      await authClient.post("volunteer/logout/", {});
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false };
    }
  },

  // --- GET CURRENT LOGGED-IN USER ---
  getCurrentUser: async () => {
    try {
      const response = await authClient.get("user/");
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Get current user error:", error);
      return { success: false, error: "Failed to fetch current user" };
    }
  },
};

// ======================================================
// 🔧 EXPORT MAIN API INSTANCE FOR OTHER FEATURES
// ======================================================
export default api;
