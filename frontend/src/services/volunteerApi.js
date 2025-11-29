import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Error Interceptor 
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.data) {
      
      return Promise.reject(error.response.data);
    }

    // Network error
    if (error.message === "Network Error") {
      return Promise.reject({ _general: "Unable to reach server. Please try again." });
    }

    // Other unexpected error
    return Promise.reject({ _general: error.message || "Something went wrong." });
  }
);

// Registration 
export const registerVolunteer = async (formData) => {
  try {
    const res = await api.post("/volunteers/register/", formData, {
      headers: { "Content-Type": "application/json" },
    });
    return { success: true, data: res.data };
  } catch (err) {
    return {
      success: false,
      error: err._general || err.account?.email || "Something went wrong.",
    };
  }
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
