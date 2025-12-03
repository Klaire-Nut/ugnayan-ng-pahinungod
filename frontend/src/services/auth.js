// src/services/auth.js
import axios from "axios";

axios.defaults.withCredentials = true;

const BASE = "http://127.0.0.1:8000/api";

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
  }

  const res = await axios.post(
    `${BASE}/volunteers/login/`,
    { email, password },
    { withCredentials: true }
  );

  return {
    role: "Volunteer",
    data: res.data.volunteer,
  };
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
    const v = await axios.get(`${BASE}/volunteers/profile/`, {
      withCredentials: true,
    });

    if (v.data?.volunteer_id) {
      return { role: "Volunteer", data: v.data };
    }

    const a = await axios.get(`${BASE}/auth/user/`, {
      withCredentials: true,
    });

    if (a.data?.user) {
      return { role: "Admin", data: a.data.user };
    }

    return { role: null, data: null };
  } catch {
    return { role: null, data: null };
  }
};
