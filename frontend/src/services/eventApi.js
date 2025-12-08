import { apiClient } from "./apiClient";

// PUBLIC LIST
export function getPublicEvents() {
  return apiClient("/events/", "GET", null, false);
}

// PUBLIC DETAILS
export function getPublicEventDetails(id) {
  return apiClient(`/events/${id}/`, "GET", null, false);
}

// VOLUNTEER: LIST EVENTS
export function getVolunteerEvents() {
  return apiClient("/events/volunteer/", "GET", null, true);
}

// VOLUNTEER: EVENT DETAILS
export function getVolunteerEventDetails(id) {
  return apiClient(`/events/volunteer/${id}/`, "GET", null, true);
}

// VOLUNTEER: JOIN EVENT
export function joinEvent(event_id) {
  return apiClient("/events/volunteer/join/", "POST", { event_id }, true);
}
