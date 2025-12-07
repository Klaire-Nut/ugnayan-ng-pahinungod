// src/pages/Events.jsx
import React, { useEffect, useState } from "react";
import VolunteerEventCard from "../components/VolunteerEventCard.jsx";
import { getPublicEvents } from "../services/eventApi";   // ⭐ Use PUBLIC endpoint

const PublicEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getPublicEvents();  // ⭐ PUBLIC API, not volunteer API
        setEvents(data);
      } catch (err) {
        console.error("Failed to load public events:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ marginBottom: "1rem" }}>Events</h1>

      {events.length === 0 ? (
        <p>No events found.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "20px",
          }}
        >
          {events.map((event) => (
            <VolunteerEventCard key={event.event_id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicEvents;