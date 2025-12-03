// src/pages/Event.jsx
import React, { useEffect, useState } from "react";
import { getPublicEvents } from "../services/eventApi";
import "../styles/Dashboard.css"; // Reuse your event card styles

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      const res = await getPublicEvents();
      setEvents(res);
      setLoading(false);
    };

    loadEvents();
  }, []);

  const formatTime = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) return <div style={{ padding: "2rem" }}>Loading events...</div>;

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Events</h1>
      <p>Upcoming and past events will be listed here.</p>

      <div className="events-grid">
        {events.length === 0 && <p>No events available.</p>}

        {events.map((event) => (
          <div key={event.event_id} className="event-card upcoming">
            <div className="event-header">
              <h3>{event.event_name}</h3>
            </div>

            <p>📍 {event.location}</p>
            <p>
              🕐 {formatTime(event.date_start)} – {formatTime(event.date_end)}
            </p>
            <p>
              👥 {event.available_slots} slots available
            </p>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Events;
