import React, { useState } from "react";
import "../../styles/Dashboard.css";
import EventCreateModal from "./EventCreateModal";
import EventCard from "../../components/EventCard";

const AdminEvents = () => {
  const [openModal, setOpenModal] = useState(false);

  // temporary sample events
  const [events, setEvents] = useState([]);

  const handleDelete = (id) => {
    setEvents(events.filter(ev => ev.id !== id));
  };

  const handleEdit = (event) => {
    console.log("Edit event:", event);
    // will open edit modal later
  };

  const handleCreateEvent = (newEvent) => {
    // give the event a unique id
    const eventWithId = { ...newEvent, id: Date.now() };

    setEvents((prev) => [...prev, eventWithId]);
    setOpenModal(false);
  };

  return (
    <div className="admin-events-wrapper">
      
      {/* Header */}
      <div className="events-header">
        <h2 className="events-title">EVENTS</h2>

        <button 
          className="add-event-btn"
          onClick={() => setOpenModal(true)}
        >
          + ADD EVENT
        </button>
      </div>

      {/* Events Content */}
      <section className="events-section fade-in">
        <div className="events-grid">
          {/* Event cards will go here */}
          {events.length === 0 ? (
            <div className="event-empty">
              No events available. Click "Add Event" to create one.
            </div>
          ) : (
            events.map(ev => (
              <EventCard 
                key={ev.id}
                event={ev}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </section>

      {/* Modal appears here */}
      {openModal && (
        <EventCreateModal
          onClose={() => setOpenModal(false)}
          onCreate={handleCreateEvent}
        />
      )}

    </div>
  );
};

export default AdminEvents;