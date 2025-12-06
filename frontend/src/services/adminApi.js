import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/admin/";

// Get dashboard summary
  export const getAdminDashboard = () => {
    return axios.get(`${API_URL}dashboard/`, { withCredentials: true });
  };

// Events
  // Fetch all the Events 
  export const getAllEvents = async () => {
    const res = await axios.get(`${API_URL}events/`, { withCredentials: true });
    return res.data;
  };

  // Create Event
  export const createAdminEvent = async (data) => {
    try {
      const response = await axios.post(
        `${API_URL}create-event/`, 
        data,
        { withCredentials: true }
      );
      return response;
    } catch (error) {
      console.error("API ERROR (createAdminEvent):", error.response?.data || error);
      throw error;
    }
  };

  // Update event
  export const updateAdminEvent = async (eventId, payload) => {
    try {
      const response = await axios.put(
        `${API_URL}events/${eventId}/`,
        payload,
        { withCredentials: true }
      );
      return response; // caller will use response.data
    } catch (err) {
      console.error("API ERROR (updateAdminEvent):", err.response?.data || err);
      throw err;
    }
  };

  // Cancel event
  export const cancelAdminEvent = async (eventId) => {
    try {
      const response = await axios.post(
        `${API_URL}events/${eventId}/cancel/`,
        {},
        { withCredentials: true }
      );
      return response;
    } catch (err) {
      console.error("API ERROR (cancelAdminEvent):", err.response?.data || err);
      throw err;
    }
  };

  // Restore event 
  export const restoreAdminEvent = async (eventId) => {
    try {
      const response = await axios.post(
        `${API_URL}events/${eventId}/restore/`,
        {},
        { withCredentials: true }
      );
      return response;
    } catch (err) {
      console.error("API ERROR (restoreAdminEvent):", err.response?.data || err);
      throw err;
    }
  };

  // Delete event 
  export const deleteAdminEvent = async (eventId) => {
    try {
      const response = await axios.delete(
        `${API_URL}events/${eventId}/`,
        { withCredentials: true }
      );
      return response;
    } catch (err) {
      console.error("API ERROR (deleteAdminEvent):", err.response?.data || err);
      throw err;
    }
  };


// Admin Privacy Settings - For Changing Password
export const updateAdminProfile = async (payload) => {
  return axios.put(`${API_URL}profile/`, payload, { withCredentials: true });
};

// Volunteer Management
  // Fetch single volunteer
  export const fetchAdminVolunteerById = async (volunteerId) => {
    try {
      const response = await axios.get(`${API_URL}volunteers/${volunteerId}/`, { withCredentials: true });
      return response.data; 
    } catch (err) {
      console.error("Error fetching volunteer by ID:", err.response?.data || err);
      throw err;
    }
  };

  // Update volunteer
  export const updateVolunteer = async (id, payload) => {
    try {
      const res = await axios.patch(
        `${API_URL}volunteers/${id}/`,
        payload,
        { withCredentials: true }
      );
      return res.data;
    } catch (err) {
      console.error("API ERROR (updateVolunteer):", err.response?.data || err);
      throw err;
    }
  };


  // Data Statistics
  export const getAdminDataStatistics = () => {
    return axios.get(`${API_URL}data-statistics/`, {
      withCredentials: true,
    });
  };


  // Fetch Volunteer History
  export const fetchVolunteerHistory = async (volunteerId) => {
    try {
      const res = await axios.get(`${API_URL}volunteers/${volunteerId}/history/`, {
        withCredentials: true, // <- important to send session cookie
      });
      return res.data; // should return array of { event, date, timeIn, timeOut, timeAllotted }
    } catch (err) {
      console.error("Error fetching volunteer history:", err.response?.data || err);
      return [];
    }
  };
