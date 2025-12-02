// src/services/eventApi.js
import api from './api'; // Axios instance already configured with baseURL and interceptors

// ==================== PUBLIC EVENT ENDPOINTS ====================
// Public endpoints are accessible to anyone
export const getPublicEvents = async (params = {}) => {
  const response = await api.get('/events/', { params }); // Matches path('events/', ...)
  return response.data;
};

export const getPublicEventDetail = async (eventId) => {
  const response = await api.get(`/events/${eventId}/`); // Matches path('events/<int:event_id>/', ...)
  return response.data;
};

// ==================== ADMIN EVENT ENDPOINTS ====================
// Admin routes must match the Django urls.py exactly
export const adminGetEvents = async (params = {}) => {
  const response = await api.get('/events/admin/events/', { params }); 
  return response.data;
};

export const adminCreateEvent = async (eventData) => {
  const response = await api.post('/events/admin/events/', eventData); 
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
  const response = await api.patch(`/events/admin/events/${eventId}/`, eventData);
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
  const response = await api.get(`/events/admin/events/${eventId}/volunteers/`);
  return response.data;
};

export const adminUpdateVolunteerEvent = async (eventId, volunteerId, data) => {
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

// ✅ This was the main fix that resolved your 404 issue:
// Volunteer endpoints now exactly match Django paths in urls.py

// List all available events for volunteers
export const volunteerGetEvents = async (params = {}) => {
  const response = await api.get('/volunteer/events/', { params }); // Corrected path
  return response.data;
};

// Get specific event detail for a volunteer
export const volunteerGetEventDetail = async (eventId) => {
  const response = await api.get(`/volunteer/events/${eventId}/`); // Corrected path
  return response.data;
};

// Volunteer joins an event
export const volunteerJoinEvent = async (eventData) => {
  const response = await api.post('/volunteer/events/join/', eventData); // Corrected path
  return response.data;
};

// Get all events that the volunteer has joined
export const volunteerGetMyEvents = async (params = {}) => {
  const response = await api.get('/volunteer/my-events/', { params }); // Corrected path
  return response.data;
};

// Drop a volunteer event
export const volunteerDropEvent = async (eventId) => {
  const response = await api.post(`/volunteer/events/${eventId}/drop/`); // Corrected path
  return response.data;
};

// Update volunteer availability for an event
export const volunteerUpdateAvailability = async (eventId, availabilityData) => {
  const response = await api.patch(
    `/volunteer/events/${eventId}/availability/`, // Corrected path
    availabilityData
  );
  return response.data;
};
