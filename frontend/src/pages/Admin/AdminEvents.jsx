import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import EventCard from "../../components/EventCard";
import NotificationModal from "../../components/NotificationModal";
import EventCreateModal from "./EventCreateModal";

import { adminGetEvents } from "../../services/adminApi";
import { apiClient } from "../../services/apiClient";

import { FaPlus, FaSearch } from "react-icons/fa";

import "../../styles/AdminEvents.css";

export default function AdminEvents() {
  const navigate = useNavigate();
  const location = useLocation();

  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [mode, setMode] = useState("create");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [notif, setNotif] = useState({ open: false, type: "", message: "" });

  const token = localStorage.getItem("token");
  const API = "http://localhost:8000/api/admin/events/";

  const showNotif = (type, message) => {
    setNotif({ open: true, type, message });
  };

  // ----------------------------------------------------------
  // LOAD EVENTS
  // ----------------------------------------------------------
  const loadEvents = async () => {
    try {
      const data = await adminGetEvents();
      setEvents(data);
      setFiltered(data);
    } catch (err) {
      showNotif("error", err.message);
    }
  };

  // ----------------------------------------------------------
  // SEARCH LOGIC ONLY
  // ----------------------------------------------------------
  useEffect(() => {
    const q = search.toLowerCase();

    const results = events.filter((e) =>
      e.event_name.toLowerCase().includes(q)
    );

    setFiltered(results);
  }, [search, events]);

  // ----------------------------------------------------------
  // INITIAL LOAD + LISTEN
  // ----------------------------------------------------------
  useEffect(() => {
    loadEvents();

    const refreshHandler = () => loadEvents();
    window.addEventListener("eventUpdated", refreshHandler);

    if (location.state?.mode === "edit") {
      setMode("edit");
      setSelectedEvent(location.state.event);
      setOpenModal(true);
    }

    return () => window.removeEventListener("eventUpdated", refreshHandler);
  }, []);

  // ----------------------------------------------------------
  // CREATE / UPDATE / DELETE EVENT HANDLERS
  // ----------------------------------------------------------
  const handleCreateEvent = async (form) => {
    try {
      const res = await apiClient(API, "POST", form);

      if (!res.ok) throw new Error("Failed to create event");

      const event = await res.json();
      const eventId = event.event_id;

      for (const s of form.schedules) {
        await apiClient(`${API}${eventId}/schedule/`, "POST", s);
      }


      showNotif("success", "Event created successfully!");
      setOpenModal(false);
      loadEvents();
    } catch (err) {
      showNotif("error", err.message);
    }
  };

  const handleUpdateEvent = async (event_id, form) => {
    try {
      const res = await apiClient(`${API}${event_id}/`, "PUT", form);

      if (!res.ok) throw new Error("Failed to update event");

      await apiClient(`${API}${event_id}/schedule/`, "DELETE");

      for (const s of form.schedules) {
        await apiClient(`${API}${event_id}/schedule/`, "POST", s);
      }

      showNotif("success", "Event updated successfully!");
      setOpenModal(false);
      window.dispatchEvent(new Event("eventUpdated"));
      loadEvents();
    } catch (err) {
      showNotif("error", err.message);
    }
  };

  const handleDeleteEvent = async (event_id) => {
    try {
      await apiClient(`${API}${event_id}/`, "DELETE");


      showNotif("warning", "Event deleted.");
      window.dispatchEvent(new Event("eventUpdated"));
      loadEvents();
    } catch (err) {
      showNotif("error", err.message);
    }
  };

  return (
    <div className="admin-events-wrapper">

      {/* HEADER */}
      <div className="events-header">
        <h2 className="events-title">EVENTS</h2>

        <button
          className="add-event-btn"
          onClick={() => {
            setMode("create");
            setSelectedEvent(null);
            setOpenModal(true);
          }}
        >
          <FaPlus style={{ marginRight: 6 }} /> Add Event
        </button>
      </div>

      {/* SEARCH BAR ONLY */}
      <div className="events-search-bar" style={{ marginBottom: "20px" }}>
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search events…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* EVENTS GRID */}
      <section className="events-section fade-in">
        <div className="events-grid">
          {filtered.length === 0 ? (
            <div className="event-empty">No events found.</div>
          ) : (
            filtered.map((ev) => (
              <EventCard
                key={ev.event_id}
                event={ev}
                onOpen={() => navigate(`/admin/events/${ev.event_id}`)}
                onEdit={() => {
                  setMode("edit");
                  setSelectedEvent(ev);
                  setOpenModal(true);
                }}
                onDelete={() => handleDeleteEvent(ev.event_id)}
              />
            ))
          )}
        </div>
      </section>

      {openModal && (
        <EventCreateModal
          open={openModal}
          mode={mode}
          eventData={selectedEvent}
          onCreate={handleCreateEvent}
          onUpdate={handleUpdateEvent}
          onClose={() => setOpenModal(false)}
        />
      )}

      <NotificationModal
        open={notif.open}
        type={notif.type}
        message={notif.message}
        onClose={() => setNotif({ ...notif, open: false })}
      />

    </div>
  );
}