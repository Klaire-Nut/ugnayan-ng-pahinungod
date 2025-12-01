import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/admin/";

// Get dashboard summary
export const getAdminDashboard = () => {
  return axios.get(`${API_URL}dashboard/`, { withCredentials: true });
};
