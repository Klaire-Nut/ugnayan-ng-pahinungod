import React, { useEffect, useState } from "react";
import VolunteerEventCard from "../components/VolunteerEventCard";
import { volunteerGetEvents } from "../services/eventApi";

const VolunteerEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load events
  useEffect(() => {
    const load = async () => {
      try {
        const data = await volunteerGetEvents();
        setEvents(data);
      } catch (err) {
        console.error("Failed to load events:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard-page">
      <Sidebar />

      <main className="dashboard-content" style={{ padding: "2rem" }}>
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
      </main>
    </div>
  );
};

export default VolunteerEvents;
