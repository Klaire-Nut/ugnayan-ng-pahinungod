import React, { useState, useEffect } from "react";
import VolunteerHeader from "../components/VolunteerHeader";
import VolunteerSidebar from "../components/VolunteerSidebar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import "../styles/admin-shared.css";
import "../styles/volunteer-fix.css";

export default function DefaultPageVolunteer() {
  const [events, setEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);

  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // -----------------------------------------
  // FETCH AVAILABLE EVENTS
  // -----------------------------------------
  useEffect(() => {
    if (!token) return;

    const loadEvents = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/events/volunteer/events/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        // keep original fields (event_id, date_start, schedules, etc.)
        setEvents(data);
      } catch (err) {
        console.error("Error loading events:", err);
      }
    };

    loadEvents();
  }, [token]);

  // -----------------------------------------
  // FETCH VOLUNTEER JOINED EVENTS
  // -----------------------------------------
  useEffect(() => {
    if (!token) return;

    const loadJoined = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/events/volunteer/my-events/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        // Backend returns: {event_id, event_name, status}
        setJoinedEvents(
          data.map((j) => ({
            event_id: j.event_id,
            event_name: j.event_name,
            status: j.status,
          }))
        );
      } catch (err) {
        console.error("Error loading joined events:", err);
      }
    };

    loadJoined();
  }, [token]);

  return (
    <div className="admin-layout vol-dashboard">
      {/* Header */}
      <div className="admin-header">
        <VolunteerHeader isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      </div>

      <div className="admin-main">
        
        {/* Sidebar */}
        <aside className="admin-sidebar vol-sidebar">
          <VolunteerSidebar />
        </aside>

        {/* Main content */}
        <section className="admin-content">
          <div className="admin-content-inner">
            <Outlet
              context={{
                events,
                joinedEvents,
                setJoinedEvents,
              }}
            />
          </div>
        </section>

      </div>

      <footer className="admin-footer">
        <Footer />
      </footer>
    </div>
  );
}