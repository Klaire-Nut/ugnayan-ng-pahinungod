// src/pages/EventDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Chip,
  Box,
  Button,
  Paper,
  Collapse,
  IconButton,
} from "@mui/material";

import {
  FaArrowLeft,
  FaEdit,
  FaTrash,
  FaBan,
  FaUndo,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaUserFriends,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import { apiClient } from "../../services/apiClient";
import EventCreateModal from "./EventCreateModal";

function formatAffiliation(type) {
  if (!type) return "N/A";

  const map = {
    student: "Student",
    alumni: "Alumni",
    staff: "UP Staff",
    faculty: "Faculty",
    retiree: "Retiree",
  };

  return map[type] || "Unknown";
}

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [scheduleData, setScheduleData] = useState([]); // schedules with volunteers
  const [expandedScheduleIds, setExpandedScheduleIds] = useState([]);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [snack, setSnack] = useState({ open: false, severity: "success", message: "" });

  const [editHoursOpen, setEditHoursOpen] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [newHours, setNewHours] = useState("");

  const formatName = (v) => {
    const info = v || {};
    const raw = info.name || "";
    if (!raw) return "Unknown";
    const parts = raw.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    const f = parts[0];
    const l = parts.slice(1).join(" ");
    return `${l}, ${f}`;
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (timeStr) => {
    if (!timeStr) return "—";
    const [h, m] = timeStr.split(":");
    const d = new Date();
    d.setHours(h, m);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const toggleExpand = (schId) => {
    setExpandedScheduleIds(prev =>
      prev.includes(schId) ? prev.filter(x => x !== schId) : [...prev, schId]
    );
  };

  const openEditHoursDialog = (vol, schedule) => {
    // vol is object from serializer: { ves_id, volunteer_id, name, email, hours_rendered }
    setSelectedVolunteer({ ...vol, schedule_id: schedule.id });
    setNewHours(vol.hours_rendered ?? 0);
    setEditHoursOpen(true);
  };

  /** -------------------------------
   * LOAD EVENT DETAILS + SCHEDULES+VOLUNTEERS
   * ------------------------------- */
  const loadEvent = async () => {
    try {
      const data = await apiClient(
        `http://localhost:8000/api/admin/events/${id}/detail/`,
        "GET",
        null
      );
      setEvent(data);
    } catch (err) {
      console.error("LOAD EVENT ERROR:", err);
    }
  };

  const loadSchedulesWithVolunteers = async () => {
    try {
      const data = await apiClient(
        `http://localhost:8000/api/admin/events/${id}/schedules/`,
        "GET",
        null
      );
      // data.schedules -> array of schedule objects with volunteers
      setScheduleData(Array.isArray(data.schedules) ? data.schedules : []);
    } catch (err) {
      console.error("LOAD SCHEDULE VOLUNTEERS ERROR:", err);
      setScheduleData([]);
    }
  };

  useEffect(() => {
    loadEvent();
    loadSchedulesWithVolunteers();
    // eslint-disable-next-line
  }, [id]);

  if (!event) return <p>Loading event details...</p>;

  /** -------------------------------
   * EVENT STATUS LOGIC
   * ------------------------------- */
  const computeStatus = () => {
    if (event.is_cancelled) return "CANCELLED";

    const schedules = event.schedules || [];
    if (!schedules.length) return "UPCOMING";

    const now = new Date();
    const first = schedules[0];
    const last = schedules[schedules.length - 1];

    const start = new Date(`${first.date}T${first.start_time}`);
    const end = new Date(`${last.date}T${last.end_time}`);

    if (now < start) return "UPCOMING";
    if (now >= start && now <= end) return "HAPPENING";
    return "DONE";
  };

  const status = computeStatus();

  /** -------------------------------
   * CANCEL / UNDO CANCEL / DELETE
   * ------------------------------- */
  const confirmCancel = async () => {
    try {
      await apiClient(
        `http://localhost:8000/api/admin/events/${id}/cancel/`,
        "POST",
        null
      );
      setCancelOpen(false);
      await loadEvent();
    } catch (err) {
      console.error(err);
    }
  };

  const undoCancel = async () => {
    try {
      await apiClient(
        `http://localhost:8000/api/admin/events/${id}/uncancel/`,
        "POST",
        null
      );
      setCancelOpen(false);
      await loadEvent();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this event?")) return;

    try {
      await apiClient(
        `http://localhost:8000/api/admin/events/${id}/`,
        "DELETE",
        null
      );
      navigate("/admin/events");
    } catch (err) {
      console.error(err);
    }
  };

  const saveHours = async () => {
    if (!selectedVolunteer) return;
    const vesId = selectedVolunteer.ves_id || selectedVolunteer.id;

    try {
      await apiClient(
        `http://localhost:8000/api/admin/events/${id}/schedules/${vesId}/`,
        "PATCH",
        { hours_rendered: Number(newHours) }
      );

      // refresh the schedule data after update
      await loadSchedulesWithVolunteers();

      setSnack({ open: true, severity: "success", message: "Hours updated successfully" });
      setEditHoursOpen(false);
    } catch (err) {
      console.error(err);
      setSnack({ open: true, severity: "error", message: "Save failed" });
    }
  };

  /** -------------------------------
   * UI RENDER
   * ------------------------------- */
  return (
    <Box sx={{ maxWidth: "1100px", mx: "auto", mt: 3, pb: 8 }}>

      {/* BACK BUTTON */}
      <Button
        startIcon={<FaArrowLeft />}
        onClick={() => navigate(-1)}
        sx={{
          mb: 2,
          textTransform: "none",
          fontWeight: 600,
          color: "#444",
        }}
      >
        Back
      </Button>

      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            {event.event_name}
          </Typography>

          <Chip
            label={status}
            color={
              status === "UPCOMING"
                ? "primary"
                : status === "HAPPENING"
                ? "success"
                : status === "DONE"
                ? "info"
                : "error"
            }
            size="small"
            sx={{ fontWeight: 700, px: 1 }}
          />

          {event.is_cancelled && (
            <Typography sx={{ mt: 1, color: "error.main", fontWeight: 700 }}>
              This event is CANCELLED.
            </Typography>
          )}
        </Box>

        {/* ACTION BUTTONS */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FaEdit />}
            disabled={event.is_cancelled}
            onClick={() => setEditOpen(true)}
          >
            Edit
          </Button>

          <Button
            variant="outlined"
            size="small"
            color={event.is_cancelled ? "primary" : "warning"}
            startIcon={event.is_cancelled ? <FaUndo /> : <FaBan />}
            onClick={() => setCancelOpen(true)}
          >
            {event.is_cancelled ? "Undo Cancel" : "Cancel"}
          </Button>

          <Button
            variant="contained"
            size="small"
            color="error"
            startIcon={<FaTrash />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* EVENT INFORMATION */}
      <Card sx={{ mb: 4, borderRadius: 3, p: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Event Information
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
          <FaMapMarkerAlt size={17} color="#9b1c1c" style={{ marginRight: 8 }} />
          <Typography sx={{ fontSize: "1rem" }}>{event.location}</Typography>
        </Box>

        <Typography sx={{ color: "#555" }}>
          {event.description || "No description provided."}
        </Typography>
      </Card>

      {/* SCHEDULE SECTION */}
      <Card sx={{ mb: 4, borderRadius: 3, p: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Event Schedule
        </Typography>

        {event.schedules?.map((sch, i) => {
          const taken = sch.filled_slots || sch.slots_taken || 0;
          const max = sch.max_slots || 0;

          return (
            <Box
              key={i}
              sx={{
                p: 2,
                borderRadius: 2,
                border: "1px solid #e2e2e2",
                background: "#fafafa",
                mb: 2,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontWeight: 700, mb: 1 }}>
                  Day {i + 1}
                </Typography>

                <Typography sx={{ color: "#666" }}>
                  Slots: <strong>{taken}</strong> / <strong>{max}</strong>
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <FaCalendarAlt size={14} style={{ marginRight: 8 }} />
                <Typography>{formatDate(sch.date)}</Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <FaClock size={14} style={{ marginRight: 8 }} />
                <Typography>
                  {formatTime(sch.start_time)} – {formatTime(sch.end_time)}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Card>

      {/* VOLUNTEERS BY SCHEDULE (DROPDOWNS) */}
      <Card sx={{ borderRadius: 3, p: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Volunteers by Schedule
        </Typography>

        {scheduleData.length === 0 && <Typography>No schedules or volunteers yet.</Typography>}

        {scheduleData.map((sch) => {
          const isOpen = expandedScheduleIds.includes(sch.id);
          return (
            <Box key={sch.id} sx={{ mb: 2 }}>
              <Paper sx={{ p: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>
                    {sch.day || `Schedule ${sch.id}`} — {formatDate(sch.date)}
                  </Typography>
                  <Typography sx={{ color: "#666", fontSize: "0.9rem" }}>
                    {sch.start_time ? `${formatTime(sch.start_time)} – ${formatTime(sch.end_time)}` : ""}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Typography sx={{ color: "#666" }}>{(sch.volunteers || []).length} volunteers</Typography>
                  <IconButton size="small" onClick={() => toggleExpand(sch.id)}>
                    {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                  </IconButton>
                </Box>
              </Paper>

              <Collapse in={isOpen}>
                <Box sx={{ mt: 1 }}>
                  <Paper sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #ddd" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead style={{ background: "#f3f3f3", fontWeight: 700 }}>
                        <tr>
                          <th style={{ padding: "8px", textAlign: "left" }}>Name</th>
                          <th style={{ padding: "8px", textAlign: "left" }}>Email</th>
                          <th style={{ padding: "8px", textAlign: "left" }}>Hours</th>
                          <th style={{ padding: "8px", textAlign: "left" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sch.volunteers && sch.volunteers.length > 0 ? (
                          sch.volunteers.map((v) => (
                            <tr key={v.ves_id}>
                              <td style={{ padding: "8px" }}>{v.name}</td>
                              <td style={{ padding: "8px" }}>{v.email ?? "-"}</td>
                              <td style={{ padding: "8px" }}>{v.hours_rendered}</td>
                              <td style={{ padding: "8px" }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => openEditHoursDialog(v, sch)}
                                >
                                  Edit Hours
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} style={{ padding: "8px" }}>
                              No volunteers for this schedule.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </Paper>
                </Box>
              </Collapse>
            </Box>
          );
        })}
      </Card>

      {/* EDIT MODAL */}
      <EventCreateModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        mode="edit"
        eventData={event}
        onUpdate={async (eventId, form) => {
          await apiClient(
            `http://localhost:8000/api/admin/events/${eventId}/`,
            "PUT",
            {
              event_name: form.event_name,
              description: form.description,
              location: form.location,
            }
          );

          await apiClient(
            `http://localhost:8000/api/admin/events/${eventId}/schedule/`,
            "DELETE",
            null
          );

          for (const sched of form.schedules) {
            await apiClient(
              `http://localhost:8000/api/admin/events/${eventId}/schedule/`,
              "POST",
              sched
            );
          }

          await loadEvent();
          setEditOpen(false);
          setSuccessOpen(true);
        }}
      />

      {/* CANCEL MODAL */}
      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {event.is_cancelled ? "Undo Cancel Event" : "Cancel Event"}
        </DialogTitle>

        <DialogContent>
          <Typography sx={{ mb: 1 }}>
            Event: <strong>{event.event_name}</strong>
          </Typography>

          {event.is_cancelled ? (
            <Typography color="primary">This will restore the event.</Typography>
          ) : (
            <Typography color="error">This will mark the event as CANCELLED.</Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setCancelOpen(false)}>Close</Button>

          {event.is_cancelled ? (
            <Button onClick={undoCancel} variant="contained">
              Undo Cancel
            </Button>
          ) : (
            <Button onClick={confirmCancel} variant="contained" color="error">
              Cancel Event
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* EDIT HOURS DIALOG */}
      <Dialog open={editHoursOpen} onClose={() => setEditHoursOpen(false)}>
        <DialogTitle>Edit Rendered Hours</DialogTitle>

        <DialogContent sx={{ minWidth: "320px" }}>
          <Typography sx={{ mb: 1 }}>
            Volunteer: <strong>{selectedVolunteer?.name}</strong>
          </Typography>

          <Typography sx={{ mb: 1 }}>
            Current Hours: <strong>{selectedVolunteer?.hours_rendered ?? selectedVolunteer?.hours}</strong>
          </Typography>

          <input
            type="number"
            value={newHours}
            onChange={(e) => setNewHours(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              fontSize: "1rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditHoursOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveHours}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={successOpen}
        autoHideDuration={2500}
        onClose={() => setSuccessOpen(false)}
      >
        <Alert onClose={() => setSuccessOpen(false)} severity="success" variant="filled">
          Event updated successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
        >
          {snack.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}
