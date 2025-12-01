import React, { useState, useEffect } from "react";
import VolunteerHeader from "../components/VolunteerHeader";
import VolunteerSidebar from "../components/VolunteerSidebar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import "../styles/admin-shared.css";

export default function DefaultPageVolunteer() {
  const [events, setEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);

  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // 🔥 Fetch all events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/events");
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error("Failed to load events:", err);
      }
    };

    fetchEvents();
  }, []);

  // 🔥 Fetch volunteer's joined events (if logged in)
  useEffect(() => {
    if (!token) return;

    const fetchJoined = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/volunteers/joined-events/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setJoinedEvents(data);
      } catch (err) {
        console.error("Failed to load joined events:", err);
      }
    };

    fetchJoined();
  }, [token]);

  return (
    <div className="admin-layout">
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
                setEvents,
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
