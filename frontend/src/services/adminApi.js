import { apiClient } from "./apiClient";
const BASE = "http://localhost:8000/api/admin/";

// GET all events
export function adminGetEvents() {
  return apiClient(BASE + "events/", "GET", null);
}

export function adminGetEvent(id) {
  return apiClient(BASE + `events/${id}/detail/`, "GET", null);
}

// GET all volunteers (admin list)
export function adminGetVolunteers() {
  return apiClient(BASE + "volunteers/", "GET", null);
}

// CREATE event
export function adminCreateEvent(body) {
  return apiClient(BASE + "events/", "POST", body);
}

// UPDATE event
export function adminUpdateEvent(id, body) {
  return apiClient(BASE + `events/${id}/`, "PUT", body);
}

// DELETE event
export function adminDeleteEvent(id) {
  return apiClient(BASE + `events/${id}/`, "DELETE", null);
}

// CREATE schedule
export function adminAddSchedule(eventId, body) {
  return apiClient(BASE + `events/${eventId}/schedule/`, "POST", body);
}

// DELETE ALL schedules
export function adminDeleteSchedules(eventId) {
  return apiClient(BASE + `events/${eventId}/schedule/`, "DELETE", null);
}

// EVENT STATS
export function adminEventStats(eventId) {
  return apiClient(BASE + `events/${eventId}/stats/`, "GET", null);
}

export function adminGetVolunteer(id) {
  return apiClient(`http://localhost:8000/api/admin/volunteers/${id}/`, "GET");
}

export function adminGetVolunteerHistory(id) {
  return apiClient(`http://localhost:8000/api/admin/volunteers/${id}/history/`, "GET");
}

export function adminUpdateVolunteer(id, body) {
  return apiClient(`http://localhost:8000/api/admin/volunteers/${id}/`, "PUT", body);
}
