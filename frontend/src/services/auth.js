import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/auth/";

// -----------------------------
// Register (volunteer)
// -----------------------------
export const register = (data) =>
  axios.post(`${API_URL}register/`, data, {
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

// -----------------------------
// Login
// -----------------------------
export const login = ({ email, password, role }) => {
  // Use correct Django endpoint for each role
  const url =
    role === "Admin"
      ? `${API_URL}login/`               // admin login
      : `${API_URL}volunteer/login/`;    // volunteer login

  // Body differs for Admin (username) vs Volunteer (email)
  const body =
    role === "Admin"
      ? { username: email, password }
      : { email, password };

  return axios.post(url, body, {
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });
};

// -----------------------------
// Logout
// -----------------------------
export const logout = (role) => {
  const url =
    role === "Admin"
      ? `${API_URL}logout/`               // admin logout
      : `${API_URL}volunteer/logout/`;    // volunteer logout

  return axios.post(url, {}, {
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });
};

// -----------------------------
// Get Current User / Session Check
// -----------------------------
export const getCurrentUser = (role) => {
  // Both roles can use the same endpoint for now
  const url = `${API_URL}user/`;

  return axios.get(url, {
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });
};
