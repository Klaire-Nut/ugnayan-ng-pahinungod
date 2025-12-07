// src/services/auth.js
import axios from "axios";

axios.defaults.withCredentials = true;

const BASE = "http://127.0.0.1:8000/api/";

// --------------------
// REGISTER
// --------------------
export const register = (data) =>
  axios.post(`${BASE}volunteer/register/`, data, { withCredentials: true });

// --------------------
// LOGIN (Admin or Volunteer)
// --------------------
export const login = ({ role, username, email, password }) => {
  if (role === "Admin") {
    return axios.post(
      `${BASE}auth/login/`,
      { username, password },
      { withCredentials: true }
    );
  } else {
    return axios.post(
      `${BASE}volunteer/login/`,
      { email, password },
      { withCredentials: true }
    );
  }
};

// --------------------
// LOGOUT
// --------------------
export const adminLogout = () =>
  axios.post(`${BASE}auth/logout/`, {}, { withCredentials: true });

// Generic wrapper if you still want to call logout(role)
export const logout = (role) => {
  return role === "Admin" ? adminLogout() : volunteerLogout();
};

// --------------------
// GET CURRENT LOGGED-IN USER
// --------------------
export const getCurrentUser = async () => {
  return { role: localStorage.getItem("role"), data: null };
};


// --------------------
// VOLUNTEER-SPECIFIC HELPERS
// --------------------
export const volunteerLogin = (data) =>
  axios.post(`${BASE}volunteer/login/`, data, { withCredentials: true });

export const volunteerLogout = () =>
  axios.post(`${BASE}volunteer/logout/`, {}, { withCredentials: true });

// --------------------
// LOCAL STORAGE HELPERS
// --------------------
export function saveRole(role) {
  localStorage.setItem("role", role);
}

export const removeRole = () => localStorage.removeItem("role");

export function getRole() {
  return localStorage.getItem("role");
}
