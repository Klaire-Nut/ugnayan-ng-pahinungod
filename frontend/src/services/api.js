// src/services/api.js
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

// ================================
// ⭐ 1. CREATE THE MAIN API CLIENT
// ================================
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // still okay even with TokenAuth
});

// ================================
// ⭐ 2. ADD AUTH TOKEN INTERCEPTOR
// ================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("volunteerToken");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ================================
// ⭐ 3. AUTH CLIENT (login/register)
// ================================
const authClient = axios.create({
  baseURL: `${API_BASE_URL}/auth/`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ====================================================
// 🔐 AUTH API (Volunteer)
// ====================================================
export const authAPI = {
  register: async (data) => {
    try {
      const response = await authClient.post("register/", data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.errors || "Registration failed",
      };
    }
  },

  login: async ({ email, password }) => {
    try {
      const response = await authClient.post("volunteer/login/", {
        email,
        password,
      });

      // ⭐ IMPORTANT: STORE TOKEN HERE
      if (response.data.token) {
        localStorage.setItem("volunteerToken", response.data.token);
      }

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.detail ||
          "Login failed",
      };
    }
  },

  logout: async () => {
    try {
      await authClient.post("volunteer/logout/", {});
      localStorage.removeItem("volunteerToken");
      return { success: true };
    } catch {
      return { success: false };
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await authClient.get("user/");
      return { success: true, data: response.data };
    } catch {
      return { success: false, error: "Failed to fetch current user" };
    }
  },
};

// ====================================================
// ⭐ EXPORT
// ====================================================
export default api;
