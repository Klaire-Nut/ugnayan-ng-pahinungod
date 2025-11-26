import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ----------------- Error Interceptor -----------------
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error.response?.data || { error: error.message })
);

// ----------------- Registration -----------------
export const registerVolunteer = (payload) => {
  return api.post("/volunteers/register/", payload);
};


// ----------------- Volunteers List / Get / Update -----------------
export const getVolunteers = async () => {
  const response = await api.get("/volunteers/list/");
  return response.data;
};

export const getVolunteer = async (email) => {
  const response = await api.get(`/volunteers/${email}/`);
  return response.data;
};

export const updateVolunteer = async (email, updateData) => {
  const response = await api.patch(`/volunteers/${email}/update/`, updateData);
  return response.data;
};
