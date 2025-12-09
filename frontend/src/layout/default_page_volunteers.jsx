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

  const token = localStorage.getItem("volunteerToken");
  const isLoggedIn = Boolean(token);

  const handleLogout = () => {
    localStorage.removeItem("volunteerToken");
    window.location.href = "/login";
  };

  // ---------------------------------------------------
  // FETCH ALL EVENTS
  // ---------------------------------------------------
  useEffect(() => {
    if (!token) return;

    async function loadEvents() {
      try {
        const res = await fetch("http://localhost:8000/api/volunteer/events/", {
          headers: { Authorization: `Token ${token}` },
        });

        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error("Error loading events:", err);
      }
    }

    loadEvents();
  }, [token]);

  // ---------------------------------------------------
  // FETCH JOINED EVENTS
  // ---------------------------------------------------
  useEffect(() => {
    if (!token) return;

    async function loadJoined() {
      try {
        const res = await fetch("http://localhost:8000/api/volunteer/my-events/", {
          headers: { Authorization: `Token ${token}` },
        });

        const data = await res.json();

        // normalize structure
        setJoinedEvents(
          (data || []).map((j) => ({
            event_id: j.event_id,
            event_name: j.event_name,
            status: j.status,
          }))
        );
      } catch (err) {
        console.error("Error loading joined events:", err);
      }
    }

    loadJoined();
  }, [token]);

  return (
    <div className="admin-layout vol-dashboard">
      {/* HEADER */}
      <div className="admin-header">
        <VolunteerHeader isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      </div>

      <div className="admin-main">
        {/* SIDEBAR */}
        <aside className="admin-sidebar vol-sidebar">
          <VolunteerSidebar />
        </aside>

        {/* MAIN CONTENT */}
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