// Auth for the Super Admin acc connecting to django
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/auth/";

// Register (optional)
export const register = (data) =>
  axios.post(`${API_URL}register/`, data, { withCredentials: true });

// Login
export const login = (data) =>
  axios.post(`${API_URL}login/`, data, { withCredentials: true });

// Logout
export const logout = () =>
  axios.post(`${API_URL}logout/`, {}, { withCredentials: true });

// Check user session
export const getCurrentUser = () =>
  axios.get(`${API_URL}user/`, { withCredentials: true });
