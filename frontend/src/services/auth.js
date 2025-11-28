import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/auth/";

// Register
export const register = (data) =>
  axios.post(`${API_URL}register/`, data, { withCredentials: true });

// Login
export const login = ({ email, password, role }) => {
  const url =
    role === "Admin"
      ? `${API_URL}login/`                // correct
      : `${API_URL}volunteer/login/`;    // <-- fix here, use slash

  const body =
    role === "Admin"
      ? { username: email, password }     // admin sends username
      : { email, password };

  return axios.post(url, body, { withCredentials: true });
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
