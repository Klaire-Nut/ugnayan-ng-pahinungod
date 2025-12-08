import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Chip,
  Box,
  Button,
  Paper,
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
} from "react-icons/fa";

import { DataGrid } from "@mui/x-data-grid";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import { apiClient } from "../../services/apiClient";
import EventCreateModal from "./EventCreateModal";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (timeStr) => {
    const [h, m] = timeStr.split(":");
    const d = new Date();
    d.setHours(h, m);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  /** -------------------------------
   * LOAD EVENT DETAILS
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

  /** -------------------------------
   * LOAD EVENT VOLUNTEERS
   * ------------------------------- */
  const loadVolunteers = async () => {
    try {
      const data = await apiClient(
        `http://localhost:8000/api/admin/events/${id}/volunteers/`,
        "GET",
        null
      );
      setVolunteers(data);
    } catch (err) {
      console.error("LOAD VOLUNTEERS ERROR:", err);
    }
  };

  useEffect(() => {
    loadEvent();
    loadVolunteers();
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
      loadEvent();
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
      loadEvent();
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
          const left = max - taken;

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
              <Typography sx={{ fontWeight: 700, mb: 1 }}>
                Day {i + 1}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <FaCalendarAlt size={14} style={{ marginRight: 8 }} />
                <Typography>{formatDate(sch.date)}</Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <FaClock size={14} style={{ marginRight: 8 }} />
                <Typography>
                  {formatTime(sch.start_time)} – {formatTime(sch.end_time)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                <FaUserFriends size={14} style={{ marginRight: 8 }} />
                <Typography>
                  Slots: <strong>{taken}</strong> / <strong>{max}</strong>
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Card>

      {/* VOLUNTEERS SECTION */}
      <Card sx={{ borderRadius: 3, p: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Volunteers ({volunteers.length})
        </Typography>

        <Paper sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #ddd" }}>
          <DataGrid
            rows={volunteers.map((v, index) => ({
              id: index,
              name: v.volunteer_info.name,
              email: v.volunteer_info.email,
              mobile: v.volunteer_info.mobile,
              hours: v.hours_rendered,
              status: v.status,
            }))}
            columns={[
              { field: "name", headerName: "Name", flex: 1 },
              { field: "email", headerName: "Email", flex: 1 },
              { field: "mobile", headerName: "Mobile", width: 130 },
              { field: "status", headerName: "Status", width: 130 },
              { field: "hours", headerName: "Hours", width: 100 },
            ]}
            hideFooter
            sx={{
              "& .MuiDataGrid-columnHeaders": {
                background: "#f3f3f3",
                fontWeight: 700,
              },
            }}
          />
        </Paper>
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

      <Snackbar
        open={successOpen}
        autoHideDuration={2500}
        onClose={() => setSuccessOpen(false)}
      >
        <Alert onClose={() => setSuccessOpen(false)} severity="success" variant="filled">
          Event updated successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}