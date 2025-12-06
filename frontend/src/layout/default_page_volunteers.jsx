import React, { useState, useEffect } from "react";
import VolunteerHeader from "../components/VolunteerHeader";
import VolunteerSidebar from "../components/VolunteerSidebar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import "../styles/admin-shared.css";

export default function DefaultPageVolunteer() {
  const [events, setEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [loadingVolunteers, setLoadingVolunteers] = useState(true);
  const [volunteers, setVolunteers] = useState([]);

  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Fetch volunteers
  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/admin/volunteers/");
        const data = await res.json();
        setVolunteers(data.results || []);
      } catch (err) {
        console.error("Failed to fetch volunteers:", err);
      } finally {
        setLoadingVolunteers(false);
      }
    };
    fetchVolunteers();
  }, []);

  // Fetch all events
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

  // Fetch joined events
  useEffect(() => {
    if (!token) return;
    const fetchJoined = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/volunteers/joined-events/", {
          headers: { Authorization: `Bearer ${token}` },
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
      <div className="admin-header">
        <VolunteerHeader isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      </div>

      <div className="admin-main">
        <aside className="admin-sidebar vol-sidebar">
          <VolunteerSidebar />
        </aside>

        <section className="admin-content">
          <div className="admin-content-inner">
            <Outlet
              context={{
                events,
                setEvents,
                joinedEvents,
                setJoinedEvents,
                volunteers,
                loadingVolunteers, // pass loading state
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
