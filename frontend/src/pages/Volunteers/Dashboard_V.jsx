// src/pages/Volunteer/Dashboard.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/VolunteerSidebar";
import Button from "../../components/Button";
import "../../styles/Dashboard.css";

import { getCurrentUser } from "../../services/auth";
import {
  volunteerGetEvents,
  volunteerJoinEvent,
} from "../../services/eventApi";

import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  // ==========================================================
  // FETCH CURRENT USER
  // ==========================================================
  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if (res.role === "Volunteer") {
          setUser(res.data);
          loadEvents();
        } else if (res.role === "Admin") {
          navigate("/admin");
        }
      })
      .catch(() => navigate("/login"));
  }, []);

  // ==========================================================
  // FETCH EVENTS
  // ==========================================================
  const loadEvents = async () => {
    try {
      const res = await volunteerGetEvents();
      setEvents(res); // API already returns the array
    } catch (err) {
      console.log("Error loading events:", err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // JOIN EVENT HANDLER (CORRECT PAYLOAD)
  // ==========================================================
  const handleJoin = async (eventId) => {
    try {
      // Django expects: { event: <ID>, availability_time, availability_orientation }
      await volunteerJoinEvent(eventId);

      alert("Successfully joined the event!");
      loadEvents(); // Refresh event list
    } catch (err) {
      console.log("Join error:", err.response?.data);
      alert(err.response?.data?.error || "Failed to join event");
    }
  };

  // Format time HH:MM AM/PM
  const formatTime = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="dashboard-page">
      <Sidebar />

      <main className="dashboard-content">
        <section className="events-section fade-in">
          <h2>CURRENT EVENTS</h2>

          <div className="events-grid">
            {events.length === 0 && <p>No events available right now.</p>}

            {events.map((event) => {
              const start = new Date(event.date_start);
              const end = new Date(event.date_end);
              const now = new Date();

              const isFull =
                event.available_slots !== undefined
                  ? event.available_slots <= 0
                  : false;

              const started = start < now;

              return (
                <div key={event.event_id} className="event-card upcoming">
                  <div className="event-header">
                    <h3>{event.event_name}</h3>
                    <span>Details ▾</span>
                  </div>

                  <p>📍 {event.location}</p>

                  <p>
                    🕐 {formatTime(event.date_start)} -{" "}
                    {formatTime(event.date_end)}
                  </p>

                  <p>
                    👥{" "}
                    {event.max_participants - event.available_slots}/
                    {event.max_participants}
                  </p>

                  {/* ===================================
                      JOIN BUTTON
                  =================================== */}
                  <Button
                    text={
                      started
                        ? "Event Started"
                        : isFull
                        ? "Full"
                        : "Join Event"
                    }
                    onClick={() => handleJoin(event.event_id)}
                    disabled={started || isFull}
                    className="join-btn"
                  />
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
