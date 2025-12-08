// src/services/auth.js
import axios from "axios";

axios.defaults.withCredentials = true;

const BASE = "http://127.0.0.1:8000/api/";

// --------------------
// REGISTER
// --------------------
export const register = (data) =>
  axios.post(`${BASE}volunteer/register/`, data, {
    headers: { "Content-Type": "application/json" }
  });

// --------------------
// LOGIN (Admin or Volunteer)
// --------------------
export const login = ({ role, email, password }) => {
  if (role === "Admin") {
    return axios.post(
      `${BASE}auth/login/`,
      { email, password },
      {
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  // Volunteer login (token-based)
  return axios.post(
    `${BASE}volunteer/login/`,
    { email, password },
    {
      headers: { "Content-Type": "application/json" }
    }
  );
}; // ✅ ← THIS was missing

// --------------------
// LOGOUT
// --------------------
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh");
  localStorage.removeItem("role");
  return Promise.resolve();
};

// --------------------
// GET CURRENT LOGGED-IN USER
// --------------------
export const getCurrentUser = async () => {
  return { role: localStorage.getItem("role"), data: null };
};

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
