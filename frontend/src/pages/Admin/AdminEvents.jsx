import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext, useLocation } from "react-router-dom";
import EventCreateModal from "./EventCreateModal";
import EventCard from "../../components/EventCard";
import NotificationModal from "../../components/NotificationModal";  // ✅ FIXED IMPORT
import "../../styles/Dashboard.css";

export default function AdminEvents() {
  const navigate = useNavigate();
  const location = useLocation();
  const { events, setEvents } = useOutletContext();

  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedEvent, setSelectedEvent] = useState(null);

  // 🔔 Notification modal state
  const [notif, setNotif] = useState({
    open: false,
    type: "success",
    message: ""
  });

  const showNotif = (type, message) => {
    setNotif({ open: true, type, message });
  };

  // ➕ CREATE EVENT
  const handleCreateEvent = (newEvent) => {
    const eventWithId = {
      ...newEvent,
      id: Date.now(),
      volunteered: 0,
      volunteers: [],
    };

    setEvents((prev) => [...prev, eventWithId]);
    setOpenModal(false);
    showNotif("success", "Event created successfully!");
  };

  // ✏ UPDATE EVENT
  const handleUpdateEvent = (updated) => {
    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === updated.id ? { ...ev, ...updated } : ev
      )
    );

    setSelectedEvent(null);
    setOpenModal(false);
    showNotif("success", "Event updated!");
  };

  // ❌ DELETE EVENT
  const handleDelete = (id) => {
    setEvents(events.filter((ev) => ev.id !== id));
    showNotif("warning", "Event deleted.");
  };

  // Auto-open the modal if coming from EventDetails.jsx
  useEffect(() => {
    if (location.state) {
      setModalMode("edit");
      setSelectedEvent(location.state);
      setOpenModal(true);
    }
  }, [location.state]);

  return (
    <div className="admin-events-wrapper">
      {/* PAGE HEADER */}
      <div className="events-header">
        <h2 className="events-title">EVENTS</h2>

        <button
          className="add-event-btn"
          onClick={() => {
            setModalMode("create");
            setSelectedEvent(null);
            setOpenModal(true);
          }}
        >
          + ADD EVENT
        </button>
      </div>

      {/* MAIN CONTENT */}
      <section className="events-section fade-in">
        <div className="events-grid">
          {events.length === 0 ? (
            <div className="event-empty">
              No events available. Click "Add Event" to create one.
            </div>
          ) : (
            events.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                onEdit={() => {
                  setModalMode("edit");
                  setSelectedEvent(ev);
                  setOpenModal(true);
                }}
                onDelete={() => handleDelete(ev.id)}
                onOpen={() => navigate(`/admin/events/${ev.id}`)}
              />
            ))
          )}
        </div>
      </section>

      {/* CREATE/EDIT MODAL */}
      {openModal && (
        <EventCreateModal
          mode={modalMode}
          eventData={selectedEvent}
          onCreate={handleCreateEvent}
          onUpdate={handleUpdateEvent}
          onClose={() => {
            setOpenModal(false);
            setSelectedEvent(null);
          }}
        />
      )}

      {/* NOTIFICATION MODAL */}
      <NotificationModal
        open={notif.open}
        type={notif.type}
        message={notif.message}
        onClose={() => setNotif({ ...notif, open: false })}
      />
    </div>
  );
}
