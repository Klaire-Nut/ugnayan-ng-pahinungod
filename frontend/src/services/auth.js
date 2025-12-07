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
  try {
    const v = await axios.get(`${BASE}volunteer/user/`, { withCredentials: true });
    if (v.data?.volunteer_id) return { role: "Volunteer", data: v.data };

    const a = await axios.get(`${BASE}auth/user/`, { withCredentials: true });
    if (a.data?.user) return { role: "Admin", data: a.data.user };

    return { role: null, data: null };
  } catch {
    return { role: null, data: null };
  }
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
