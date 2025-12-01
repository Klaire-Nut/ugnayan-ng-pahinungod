const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const publicEndpoints = {
  eventList: `${API_BASE_URL}/events/`,
  eventDetail: (eventId) => `${API_BASE_URL}/events/${eventId}/`,
};

const adminEndpoints = {
  eventListCreate: `${API_BASE_URL}/admin/events/`,
  eventDetail: (eventId) => `${API_BASE_URL}/admin/events/${eventId}/`,
  eventVolunteers: (eventId) => `${API_BASE_URL}/admin/events/${eventId}/volunteers/`,
  updateVolunteerEvent: (eventId, volunteerId) => `${API_BASE_URL}/admin/events/${eventId}/volunteers/${volunteerId}/`,
  cancelEvent: (eventId) => `${API_BASE_URL}/admin/events/${eventId}/cancel/`,
  eventStats: (eventId) => `${API_BASE_URL}/admin/events/${eventId}/stats/`,
};

const volunteerEndpoints = {
  eventList: `${API_BASE_URL}/volunteer/events/`,
  eventDetail: (eventId) => `${API_BASE_URL}/volunteer/events/${eventId}/`,
  joinEvent: `${API_BASE_URL}/volunteer/events/join/`,
  myEvents: `${API_BASE_URL}/volunteer/events/my-events/`,
  dropEvent: (eventId) => `${API_BASE_URL}/volunteer/events/${eventId}/drop/`,
  updateAvailability: (eventId) => `${API_BASE_URL}/volunteer/events/${eventId}/availability/`,
};

export { publicEndpoints, adminEndpoints, volunteerEndpoints };
