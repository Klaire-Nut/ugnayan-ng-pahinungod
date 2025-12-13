import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import VolunteerEventCard from "../../components/VolunteerEventCard";
import { FaSearch } from "react-icons/fa";

import "../../styles/Dashboard.css"; 
import "../../styles/AdminEvents.css"; // ensures search bar styling

function getEventStatus(event) {
  const schedules = event.schedules || [];
  if (event.is_cancelled) return "CANCELLED";
  if (!schedules.length) return "UPCOMING";

  const now = new Date();
  const first = schedules[0];
  const last = schedules[schedules.length - 1];

  const start = new Date(`${first.date}T${first.start_time}`);
  const end = new Date(`${last.date}T${last.end_time}`);

  if (now < start) return "UPCOMING";
  if (now >= start && now <= end) return "HAPPENING";
  return "DONE";
}

export default function VolunteerEvents() {
  const navigate = useNavigate();
  const { events, joinedEvents } = useOutletContext();

  // Search state
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);

  const checkJoined = (eventId) =>
    joinedEvents.some((j) => Number(j.event) === Number(eventId));

  // Sort newest → oldest
  const sortedEvents = [...events].sort((a, b) => b.event_id - a.event_id);

  // INITIAL LOAD
  useEffect(() => {
    const visible = sortedEvents.filter(
      (e) => getEventStatus(e) !== "DONE"
    );
    setFiltered(visible);
  }, [events]);

  // SEARCH FILTER
  useEffect(() => {
    const q = search.toLowerCase();
    const result = sortedEvents.filter(
      (e) =>
        getEventStatus(e) !== "DONE" &&
        e.event_name.toLowerCase().includes(q)
    );
    setFiltered(result);
  }, [search, events]);

  return (
    <div className="admin-events-wrapper">
      {/* HEADER */}
      <div className="events-header">
        <h2 className="events-title">EVENTS</h2>
      </div>

      {/*SEARCH BAR (same UI as admin) */}
      <div className="events-search-bar" style={{ marginBottom: "20px" }}>
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search events…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <section className="events-section fade-in">
        <div className="events-grid">
          {filtered.length === 0 ? (
            <div className="event-empty">No events found.</div>
          ) : (
            filtered.map((ev) => (
              <VolunteerEventCard
                key={ev.event_id}
                event={ev}
                isJoined={checkJoined(ev.event_id)}
                onOpen={() => navigate(`/volunteer/events/${ev.event_id}`)}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
