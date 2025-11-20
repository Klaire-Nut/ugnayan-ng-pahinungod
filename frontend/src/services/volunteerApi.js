// src/services/volunteerApi.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// src/services/volunteerApi.js
export const registerVolunteer = async (data) => {
  const response = await fetch('http://localhost:8000/api/volunteers/register/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

// Response interceptor for errors
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error.response?.data || { error: error.message })
);

// ----------------- OTP -----------------
export const sendOTP = async (email) => {
  return api.post("/volunteers/register/", { email });
};


export const verifyOTP = async (email, otp) => {
  console.log("API call - verifyOTP:", { email, otp });
  
  const response = await api.post("/volunteers/verify-otp/", {
    email: String(email).trim(),  
    otp: String(otp).trim(),      
  });
  
  console.log("verifyOTP response:", response);
  return response;
};

// ----------------- Final Registration -----------------
export const finalRegister = async (formData) => {
  return api.post("/volunteers/register-final/", formData);
};


export const registerVolunteerWithOTP = async (payload) => {
  return api.post("/volunteers/register-final/", payload);
};


// ----------------- Optional / existing -----------------
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