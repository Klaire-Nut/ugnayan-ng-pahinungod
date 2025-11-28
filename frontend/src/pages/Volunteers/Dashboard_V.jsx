import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
// ✅ Import from the correct event API
import * as eventsAPI from "../../services/eventApi";
import Sidebar from "../../components/Sidebar";
import "../../styles/Dashboard.css";

const Dashboard_V = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // ✅ Correct API function name from eventApi.js
      const response = await eventsAPI.getMyEvents(); // This now calls /api/events/volunteer/my-events/ ✅

      setEvents(Array.isArray(response) ? response : []);
      setLoading(false);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data");
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    const statusMap = {
      Joined: "ongoing",
      Completed: "done",
      Dropped: "cancel",
      Ongoing: "ongoing",
      Cancelled: "cancel",
      Pending: "ongoing",
    };
    return statusMap[status] || "ongoing";
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      const [hours, minutes] = timeString.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString + "T00:00:00");
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <Sidebar />
        <main className="dashboard-content">
          <div className="loading">Loading dashboard...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <Sidebar />
        <main className="dashboard-content">
          <div className="error-message">{error}</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Sidebar />

      <main className="dashboard-content">
        <div className="welcome-section">
          <h1>Welcome back, {user?.first_name}!</h1>
        </div>

        <section className="events-section fade-in">
          <h2>YOUR EVENTS</h2>
          {events.length === 0 ? (
            <p className="no-events">You haven't joined any events yet.</p>
          ) : (
            <div className="events-grid">
              {events.slice(0, 6).map((event) => (
                <div
                  key={event.id}
                  className={`event-card ${getStatusClass(event.status)}`}
                >
                  <div className="event-header">
                    <h3>{event.title}</h3>
                    <span>Detail ▾</span>
                  </div>
                  <p>📍 {event.location || "Location TBA"}</p>
                  <p>🕐 {formatTime(event.start_time)}</p>
                  <p>📅 {formatDate(event.start_date)}</p>
                  <span className={`status ${getStatusClass(event.status)}`}>
                    {event.status?.toUpperCase() || "PENDING"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="volunteers-section slide-right">
          <h2>YOUR VOLUNTEER HISTORY</h2>
          <div className="volunteers-table">
            <table>
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Date</th>
                  <th>Time In</th>
                  <th>Time Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      No history available
                    </td>
                  </tr>
                ) : (
                  events.map((event, index) => (
                    <tr key={index}>
                      <td>{event.title}</td>
                      <td>{formatDate(event.start_date)}</td>
                      <td>{formatTime(event.start_time)}</td>
                      <td>{formatTime(event.end_time)}</td>
                      <td>
                        <span
                          className={`status-badge ${getStatusClass(event.status)}`}
                        >
                          {event.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard_V;
