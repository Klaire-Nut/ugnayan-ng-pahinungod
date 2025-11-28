// Auth for the Super Admin acc connecting to django
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/auth/";

// Register
export const register = (data) =>
  axios.post(`${API_URL}register/`, data, { withCredentials: true });

// ---------------- Admin ----------------
export const login = (data) =>
  axios.post(`${API_URL}login/`, data, { withCredentials: true });

export const logout = () =>
  axios.post(`${API_URL}logout/`, {}, { withCredentials: true });

export const getCurrentUser = () =>
  axios.get(`${API_URL}user/`, { withCredentials: true });


// ---------------- Volunteer ----------------
export const volunteerLogin = (data) =>
  axios.post(`${API_URL}volunteer/login/`, data, { withCredentials: true });

export const volunteerLogout = () =>
  axios.post(`${API_URL}volunteer/logout/`, {}, { withCredentials: true })