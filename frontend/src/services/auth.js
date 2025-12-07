// src/services/auth.js
import axios from "axios";

axios.defaults.withCredentials = true;

const BASE = "http://127.0.0.1:8000/api";

// Register
export const register = (data) =>
  axios.post(`${API_URL}register/`, data, { withCredentials: true });

<<<<<<<<< Temporary merge branch 1
// ==========================
// LOGIN (Admin or Volunteer)
// ==========================
export const login = async ({ role, username, email, password }) => {
  if (role === "Admin") {
    return axios.post(
      `${BASE}/auth/login/`,
      { username, password },
      { withCredentials: true }
    );
  } else {
    return axios.post(
      `${BASE}/volunteer/login/`,
      { email, password },
      { withCredentials: true }
    );
  }
};

// Logout
export const logout = (role) => {
  const url =
    role === "Admin"
      ? `${API_URL}logout/`
      : `${API_URL}volunteer_logout/`;

  return axios.post(url, {}, { withCredentials: true });
};

// Check user session
export const getCurrentUser = (role) => {
  const url =
    role === "Admin"
      ? `${API_URL}user/`
      : `${API_URL}user/`; // keep same for now, or make separate if needed

  return axios.get(url, { withCredentials: true });
};

// ==========================
// LOGOUT
// ==========================
export const logout = async (role) => {
  if (role === "Admin") {
    return axios.post(
      `${BASE}/auth/logout/`,
      {},
      { withCredentials: true }
    );
  }

  return axios.post(
    `${BASE}/volunteers/logout/`,
    {},
    { withCredentials: true }
  );
};

// ==========================
// GET CURRENT LOGGED-IN USER
// ==========================
export const getCurrentUser = async () => {
  try {
    const v = await axios.get(`${API_URL}volunteer/user/`, { withCredentials: true });
    if (v.data?.volunteer_id) return { role: "Volunteer", data: v.data };

    const a = await axios.get(`${API_URL}auth/user/`, { withCredentials: true });
    if (a.data?.user) return { role: "Admin", data: a.data.user };

    return { role: null, data: null };
  } catch {
    return { role: null, data: null };
  }
};


// ---------------- Volunteer ----------------
export const volunteerLogin = (data) =>
  axios.post(`${API_URL}volunteer/login/`, data, { withCredentials: true });

export const volunteerLogout = () =>
  axios.post(`${API_URL}volunteer/logout/`, {}, { withCredentials: true })

// ---------------- Helpers (NEW) ----------------
export function saveRole(role) {
  localStorage.setItem("role", role);
}

export const removeRole = () => localStorage.removeItem("role");

export function getRole() {
  return localStorage.getItem("role");
}