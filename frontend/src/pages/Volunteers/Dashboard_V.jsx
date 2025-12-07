import React, { useState, useEffect } from "react";
import Sidebar from "../../components/VolunteerSidebar";
import Button from "../../components/Button";
import "../../styles/Dashboard.css";

import { useAuth } from "../../context/AuthContext";       // ✅ NEW
import {
  volunteerGetEvents,
  volunteerGetMyEvents,
  volunteerJoinEvent,
} from "../../services/eventApi";

import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();            // ✅ NEW
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    loadEvents();
    loadMyEvents();
  }, [isAuthenticated]);

  const loadEvents = async () => {
    try {
      const res = await volunteerGetEvents();
      setEvents(res || []);
    } catch (err) {
      console.log("Error loading events:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMyEvents = async () => {
    try {
      const res = await volunteerGetMyEvents();
      setMyEvents(res || []);
    } catch (err) {
      console.log("Error loading my events:", err);
    }
  };

  const isJoined = (eventId) => {
    return myEvents.some((ve) => ve.event === eventId);
  };

  const handleJoin = async (eventId) => {
    try {
      await volunteerJoinEvent(eventId);
      alert("Successfully joined the event!");

      await loadEvents();
      await loadMyEvents();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to join event");
    }
  };

  const formatTime = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const computeStatus = (start, end) => {
    const now = new Date();
    const s = new Date(start);
    const e = new Date(end);

    if (now < s) return "UPCOMING";
    if (now > e) return "DONE";
    return "ONGOING";
  };

  const getStatusClass = (status) => {
    if (status === "ONGOING") return "status ongoing";
    if (status === "DONE") return "status done";
    return "status upcoming"; 
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard-page">
      <Sidebar />

      <main className="dashboard-content">
        <section className="events-section fade-in">
          <h2>CURRENT EVENTS</h2>

          <div className="events-grid">
            {events.length === 0 && <p>No events available right now.</p>}

            {events.map((event) => {
              const status = computeStatus(event.date_start, event.date_end);
              const joined = isJoined(event.event_id);
              const isFull = event.available_slots <= 0;

              return (
                <div key={event.event_id} className="event-card">
                  <div className="event-header">
                    <h3>{event.event_name}</h3>
                  </div>

                  <div className={getStatusClass(status)}>
                    {status}
                  </div>

                  <p>📍 {event.location}</p>

                  <p>
                    🕐 {formatTime(event.date_start)} — {formatTime(event.date_end)}
                  </p>

                  <p>
                    👥 {event.max_participants - event.available_slots}/
                    {event.max_participants} Volunteers
                  </p>

                  <div className="event-button">
                    <Button
                      text={
                        joined
                          ? "Joined ✔"
                          : status !== "UPCOMING"
                          ? "Event Started"
                          : isFull
                          ? "Full"
                          : "Register"
                      }
                      onClick={() => handleJoin(event.event_id)}
                      disabled={joined || status !== "UPCOMING" || isFull}
                    />
                  </div>
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
