// src/services/eventApi.js
import api from './api';

// ==================== PUBLIC EVENT ENDPOINTS ====================
export const getPublicEvents = async (params = {}) => {
  const response = await api.get('/events/', { params });
  return response.data;
};

export const getPublicEventDetail = async (eventId) => {
  const response = await api.get(`/events/${eventId}/`);
  return response.data;
};

// ==================== ADMIN EVENT ENDPOINTS ====================
export const adminGetEvents = async (params = {}) => {
  const response = await api.get('/admin/events/', { params });
  return response.data;
};

export const adminCreateEvent = async (eventData) => {
  const response = await api.post('/admin/events/', eventData);
  return response.data;
};

export const adminGetEventDetail = async (eventId) => {
  const response = await api.get(`/admin/events/${eventId}/`);
  return response.data;
};

export const adminUpdateEvent = async (eventId, eventData) => {
  const response = await api.put(`/admin/events/${eventId}/`, eventData);
  return response.data;
};

export const adminPartialUpdateEvent = async (eventId, eventData) => {
  const response = await api.patch(`/admin/events/${eventId}/`, eventData);
  return response.data;
};

export const adminCancelEvent = async (eventId) => {
  const response = await api.patch(`/admin/events/${eventId}/cancel/`);
  return response.data;
};

export const adminDeleteEvent = async (eventId) => {
  const response = await api.delete(`/admin/events/${eventId}/`);
  return response.data;
};

export const adminGetEventVolunteers = async (eventId) => {
  const response = await api.get(`/admin/events/${eventId}/volunteers/`);
  return response.data;
};

export const adminUpdateVolunteerEvent = async (eventId, volunteerId, data) => {
  const response = await api.patch(
    `/admin/events/${eventId}/volunteers/${volunteerId}/`, 
    data
  );
  return response.data;
};

export const adminGetEventStats = async (eventId) => {
  const response = await api.get(`/admin/events/${eventId}/stats/`);
  return response.data;
};

// ==================== VOLUNTEER EVENT ENDPOINTS ====================
export const volunteerGetEvents = async (params = {}) => {
  const response = await api.get('/volunteer/events/', { params });
  return response.data;
};

export const volunteerGetEventDetail = async (eventId) => {
  const response = await api.get(`/volunteer/events/${eventId}/`);
  return response.data;
};

export const volunteerJoinEvent = async (eventData) => {
  const response = await api.post('/volunteer/events/join/', eventData);
  return response.data;
};

export const volunteerGetMyEvents = async (params = {}) => {
  const response = await api.get('/volunteer/events/my-events/', { params });
  return response.data;
};

export const volunteerDropEvent = async (eventId) => {
  const response = await api.post(`/volunteer/events/${eventId}/drop/`);
  return response.data;
};

export const volunteerUpdateAvailability = async (eventId, availabilityData) => {
  const response = await api.patch(
    `/volunteer/events/${eventId}/availability/`, 
    availabilityData
  );
  return response.data;
};