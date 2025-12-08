import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import VolunteerEventCard from "../../components/VolunteerEventCard";
import { FaSearch } from "react-icons/fa";

import "../../styles/Dashboard.css"; 
import "../../styles/AdminEvents.css"; // ensures search bar styling

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
    setFiltered(sortedEvents);
  }, [events]);

  // SEARCH FILTER
  useEffect(() => {
    const q = search.toLowerCase();
    const result = sortedEvents.filter((e) =>
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
