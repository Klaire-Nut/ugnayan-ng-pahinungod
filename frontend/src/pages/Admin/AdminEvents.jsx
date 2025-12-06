import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext, useLocation } from "react-router-dom";
import EventCreateModal from "./EventCreateModal";
import EventCard from "../../components/EventCard";
import NotificationModal from "../../components/NotificationModal";  
import "../../styles/Dashboard.css";
import {
  getAllEvents,
  createAdminEvent,
  updateAdminEvent,
  cancelAdminEvent,
  restoreAdminEvent,
  deleteAdminEvent
} from "../../services/adminApi";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";



export default function AdminEvents() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { events, setEvents } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  
  // 🔔 Notification modal state
  const [notif, setNotif] = useState({
    open: false,
    type: "success",
    message: ""
  });

  const showNotif = (type, message) => {
    setNotif({ open: true, type, message });
  };

 // Format date string nicely: "2025-12-05" → "Dec 05, 2025"
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (time) => {
  // Already normalized to "HH:MM", just return it
    return time;
  };

  // Helper to normalize schedules
    const normalizeEvent = (ev) => {
    // make a safe copy
    const schedulesRaw = ev.schedules || [];

    const schedules = schedulesRaw.map((s) => {
      // Accept multiple shapes from backend: { day } or { date } or { day: 'YYYY-MM-DD' }
      const day = s?.day ?? s?.date ?? null;

      const startRaw = s?.start_time ?? s?.start ?? "";
      const endRaw = s?.end_time ?? s?.end ?? "";

      const start_time = startRaw && startRaw.includes("T")
        ? startRaw.split("T")[1].slice(0,5)
        : startRaw;

      const end_time = endRaw && endRaw.includes("T")
        ? endRaw.split("T")[1].slice(0,5)
        : endRaw;

      return {
        date: day,
        start_time,
        end_time,
      };
    });

    return {
      ...ev,
      id: ev.id ?? ev.event_id ?? ev.eventId ?? ev.event_id, // try many variants
      schedules,
    };
  };


  // Fetch all events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await getAllEvents();
        const rawEvents = res.all_events || [];

        // Normalize schedules and add is_canceled
        const mappedEvents = rawEvents.map(ev => ({
          ...normalizeEvent(ev),
          is_canceled: ev.is_canceled || false, 
        }));

        setEvents(mappedEvents);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);



  // Auto-open modal if coming from EventDetails
  useEffect(() => {
    if (location.state) {
      setModalMode("edit");
      setSelectedEvent(location.state);
      setOpenModal(true);

      // Clear location state so it doesn’t reopen
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);



  // ➕ CREATE EVENT
  const handleCreateEvent = async (newEvent) => {
    try {
      const maxParticipants = Number(newEvent.max_participants);

      // Normalize schedules to backend-friendly format
      const schedules = (newEvent.schedules || []).map((s) => ({
        day: s.day || (Array.isArray(s.date) ? s.date[0] : s.date), // always string
        start_time: String(s.start_time),
        end_time: String(s.end_time),
      }));

      const payload = {
        event_name: newEvent.event_name,
        description: newEvent.description,
        location: newEvent.location,
        max_participants: maxParticipants > 0 ? maxParticipants : 1,
        schedules,
        date_start: newEvent.date_start,
        date_end: newEvent.date_end,
      };

      console.log("Payload to backend:", payload); // sanity check

      const savedEvent = await createAdminEvent(payload);

      if (!savedEvent || !savedEvent.data) {
        throw new Error("Backend returned invalid response");
      }

      // Normalize schedules for frontend display
      const normalized = {
        ...savedEvent.data,
        schedules: (savedEvent.data.schedules || []).map((s) => ({
          day: s.day,
          start_time: s.start_time,
          end_time: s.end_time,
        })),
      };

      setEvents((prev) => [...prev, normalized]);
      setOpenModal(false);
      showNotif("success", "Event created successfully!");
    } catch (err) {
      console.error("SERVER ERROR:", err.response?.data || err.message);
      showNotif("error", "Failed to create event.");
    }
  };


  // ✏ UPDATE EVENT
  const handleUpdateEvent = async (updated) => {
    try {
      // compute max participants from either field the modal might send
      const maxParticipants = Number(updated.max_participants ?? updated.volunteers_needed) || 1;

      // Normalize schedules (backend expects day, start_time, end_time)
      const schedules = (updated.schedules || []).map((s) => ({
        day: s.day ?? s.date ?? null,
        start_time: String(s.start_time),
        end_time: String(s.end_time),
      }));

      const payload = {
        event_name: updated.event_name,
        description: updated.description,
        location: updated.location,
        max_participants: maxParticipants,
        date_start: updated.date_start,
        date_end: updated.date_end,
        schedules,
      };

      // call API -> returns axios response; response.data is the serializer data
      const res = await updateAdminEvent(updated.id, payload);
      const saved = res.data;

      // normalize the returned event 
      const normalizedSaved = normalizeEvent(saved);

      // replace the event in state by matching id 
      setEvents((prev) => prev.map((ev) => (ev.id === normalizedSaved.id ? normalizedSaved : ev)));

      setSelectedEvent(null);
      setOpenModal(false);
      showNotif("success", "Event updated successfully!");
    } catch (err) {
      console.error("Failed to update event:", err.response?.data || err.message);
      showNotif("error", "Failed to update event.");
    }
  };


  // ❌ DELETE EVENT
  const handleDelete = async (event) => {
    try {
      await deleteAdminEvent(event.id); // backend call
      setEvents((prev) => prev.filter((ev) => ev.id !== event.id)); // update frontend
      showNotif("warning", "Event deleted."); // notification
    } catch (err) {
      console.error("Failed to delete event:", err);
      showNotif("error", "Failed to delete event.");
    } finally {
      setOpenDeleteDialog(false);
      setEventToDelete(null);
    }
  };
  
  const confirmDelete = (event) => {
    setEventToDelete(event);
    setOpenDeleteDialog(true);
  };


  
  // ❌ CANCEL EVENT
  const handleCancel = async (id) => {
    try {
      await cancelAdminEvent(id);

      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === id ? { ...ev, is_canceled: true } : ev
        )
      );

      showNotif("info", "Event canceled.");
    } catch (err) {
      console.error(err);
      showNotif("error", "Failed to cancel event.");
    }
  };

  // ♻ RESTORE EVENT
  const handleRestore = async (id) => {
    try {
      await restoreAdminEvent(id);

      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === id ? { ...ev, is_canceled: false } : ev
        )
      );

      showNotif("success", "Event restored.");
    } catch (err) {
      console.error(err);
      showNotif("error", "Failed to restore event.");
    }
  };



  if (loading) return <div>Loading events...</div>;
  if (!events.length) return <div>No events available.</div>;

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
            events.map(ev => (
              <EventCard
                key={ev.id}
                event={ev}
                onEdit={() => { setModalMode("edit"); setSelectedEvent(ev); setOpenModal(true); }}
                onDelete={confirmDelete}
                onCancel={() => handleCancel(ev.id)}
                onRestore={() => handleRestore(ev.id)}
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
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{eventToDelete?.event_name}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            color="error"
            onClick={() => {
              handleDelete(eventToDelete);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
    
  );
}

