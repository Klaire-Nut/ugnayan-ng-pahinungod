// src/services/eventApi.js
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

// =====================================================
//  VOLUNTEER AXIOS INSTANCE (TOKEN AUTH)
// =====================================================
const volunteerApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// 🔥 Automatically attach volunteer token to every request
volunteerApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// =====================================================
//  PUBLIC EVENTS (NO AUTH)
// =====================================================
export const getPublicEvents = async (params = {}) => {
  const response = await axios.get(`${API_BASE_URL}/events/`, { params });
  return response.data;
};

export const getPublicEventDetail = async (eventId) => {
  const response = await axios.get(`${API_BASE_URL}/events/${eventId}/`);
  return response.data;
};

// =====================================================
//  ADMIN EVENTS (uses admin API instance)
// =====================================================
import api from "./api"; // admin axios instance

export const adminGetEvents = async (params = {}) => {
  const response = await api.get("/events/admin/events/", { params });
  return response.data;
};

export const adminCreateEvent = async (eventData) => {
  const response = await api.post("/events/admin/events/", eventData);
  return response.data;
};

export const adminGetEventDetail = async (eventId) => {
  const response = await api.get(`/events/admin/events/${eventId}/`);
  return response.data;
};

export const adminUpdateEvent = async (eventId, eventData) => {
  const response = await api.put(`/events/admin/events/${eventId}/`, eventData);
  return response.data;
};

export const adminPartialUpdateEvent = async (eventId, eventData) => {
  const response = await api.patch(
    `/events/admin/events/${eventId}/`,
    eventData
  );
  return response.data;
};

export const adminCancelEvent = async (eventId) => {
  const response = await api.post(`/events/admin/events/${eventId}/cancel/`);
  return response.data;
};

export const adminDeleteEvent = async (eventId) => {
  const response = await api.delete(`/events/admin/events/${eventId}/`);
  return response.data;
};

export const adminGetEventVolunteers = async (eventId) => {
  const response = await api.get(
    `/events/admin/events/${eventId}/volunteers/`
  );
  return response.data;
};

export const adminUpdateVolunteerEvent = async (
  eventId,
  volunteerId,
  data
) => {
  const response = await api.patch(
    `/events/admin/events/${eventId}/volunteers/${volunteerId}/`,
    data
  );
  return response.data;
};

export const adminGetEventStats = async (eventId) => {
  const response = await api.get(`/events/admin/events/${eventId}/stats/`);
  return response.data;
};

/// ==================== VOLUNTEER EVENT ENDPOINTS ====================

// List all available events for volunteers
export const volunteerGetEvents = async (params = {}) => {
  const response = await api.get('/volunteer/events/', { params });
  return response.data;
};

// Get specific event detail for a volunteer
export const volunteerGetEventDetail = async (eventId) => {
  const response = await api.get(`/volunteer/events/${eventId}/`);
  return response.data;
};

// Volunteer joins an event
export const volunteerJoinEvent = async (eventId) => {
  const response = await api.post(
    '/volunteer/events/join/',
    {
      event: eventId,
      availability_time: "",
      availability_orientation: false
    },
    { withCredentials: true }
  );
  return response.data;
};

// Get all events the volunteer joined
export const volunteerGetMyEvents = async (params = {}) => {
  const response = await api.get('/volunteer/my-events/', { params });
  return response.data;
};

// Drop event
export const volunteerDropEvent = async (eventId) => {
  const response = await api.post(`/volunteer/events/${eventId}/drop/`);
  return response.data;
};

// Update availability
export const volunteerUpdateAvailability = async (eventId, data) => {
  const response = await api.patch(
    `/volunteer/events/${eventId}/availability/`,
    data
  );
  return response.data;
};
