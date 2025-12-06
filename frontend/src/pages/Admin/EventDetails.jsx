import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Chip,
  Box,
  Divider,
  Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlaceIcon from "@mui/icons-material/Place";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { cancelAdminEvent, restoreAdminEvent, deleteAdminEvent } from "../../services/adminApi";


export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events, setEvents, showNotif } = useOutletContext();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restoreSuccessOpen, setRestoreSuccessOpen] = useState(false);

  // Local state for the current event
  const [eventData, setEventData] = useState(null);

  // Update eventData whenever events change
  useEffect(() => {
    const ev = events.find((ev) => String(ev.id) === String(id));
    setEventData(ev || null);
  }, [events, id]);

  // Early return if eventData is not loaded
  if (!eventData) return <p>Loading event...</p>;

  // Now it's safe to access eventData
  const status =
    eventData.is_canceled || eventData.status === "CANCELLED"
      ? "CANCELLED"
      : getStatus(eventData);

  const volunteers = eventData.volunteers || [];

  
  /** STATUS */
  function getStatus(e) {
    if (e.is_canceled) return "CANCELLED"; 
    if (!e.schedules || e.schedules.length === 0) return "UPCOMING";

    const now = new Date();
    const first = new Date(e.schedules[0].date);
    const last = new Date(e.schedules[e.schedules.length - 1].date);

    if (now < first) return "UPCOMING";
    if (now >= first && now <= last) return "HAPPENING";
    if (now > last) return "DONE";

    return "UPCOMING";
  }


  const getStatusColor = (s) => {
    switch (s) {
      case "HAPPENING":
        return "success";
      case "UPCOMING":
        return "primary";
      case "CANCELLED":
        return "error";
      case "DONE":
        return "info";
      default:
        return "default";
    }
  };

  const calcRenderedHours = (start, end) => {
    if (!start || !end) return 0;
    const s = new Date(`2000-01-01 ${start}`);
    const e = new Date(`2000-01-01 ${end}`);
    return ((e - s) / 3600000).toFixed(1);
  };

  /** CANCEL EVENT */
  const handleCancel = () => setCancelOpen(true);

  const confirmCancel = async () => {
    await cancelAdminEvent(eventData.id);
    setEvents(prev =>
      prev.map(ev => ev.id === eventData.id ? { ...ev, is_canceled: true } : ev)
    );
    setCancelOpen(false);
  };


  /** RESTORE EVENT */
  const handleRestore = () => setRestoreOpen(true);

  const confirmRestore = async () => {
    try {
      await restoreAdminEvent(eventData.id);

      setEvents(prev =>
        prev.map(ev =>
          ev.id === eventData.id ? { ...ev, is_canceled: false } : ev
        )
      );

      setEventData(prev => ({
        ...prev,
        is_canceled: false
      }));

      setRestoreOpen(false);

      // Open modal
      setRestoreSuccessOpen(true);
    } catch (err) {
      console.error(err);
      showNotif("error", "Failed to restore event.");
    }
  };




  /** DELETE EVENT */
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      await deleteAdminEvent(eventData.id); // <-- backend call
      setEvents(events.filter((ev) => ev.id !== eventData.id));
      navigate("/admin/events");
    } catch (err) {
      console.error("Failed to delete event:", err);
      alert("Failed to delete event. Please try again.");
    }
  };




  return (
    <div className="event-details-wrapper">
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        Back
      </Button>

      <Card sx={{ borderRadius: 3, boxShadow: 5 }}>
      <CardHeader
        title={<Typography variant="h4">{eventData?.event_name}</Typography>}
        subheader={
          <Chip
            label={status}
            color={getStatusColor(status)}
            size="medium"
            sx={{ fontWeight: 600 }}
          />
        }
        action={
          <Box sx={{ display: "flex", gap: 1 }}>
              {/* Only show Edit if not cancelled */}
              {status !== "CANCELLED" && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/admin/events/${eventData.id}/edit`, { state: eventData })}
                >
                  Edit
                </Button>
              )}

            {/* Cancel / Restore */}
            {status !== "CANCELLED" ? (
                <Button variant="contained" color="warning" onClick={handleCancel}>
                  Cancel
                </Button>
              ) : (
                <Button variant="contained" color="success" onClick={handleRestore}>
                  Restore
                </Button>
              )}

            {/* Always show Delete */}
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Box>
        }
      />

        <CardContent>
          {status === "CANCELLED" && (
            <Box sx={{ mb: 2 }}>
              <Chip label="Event Cancelled — signups disabled" color="error" />
              <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                This event has been cancelled. Volunteer signups and actions are disabled.
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <PlaceIcon sx={{ mr: 1, color: "maroon" }} />
            <Typography variant="body1">{eventData.location}</Typography>
          </Box>

          <Typography variant="body2" sx={{ mb: 2 }}>
            {eventData.description || "No description provided."}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" sx={{ mb: 1 }}>
            Event Schedule
          </Typography>

          {eventData.schedules?.length > 0 ? (
            eventData.schedules.map((day, i) => (
              <Box key={i} sx={{ mb: 2, pl: 1 }}>
                <Typography variant="body1" fontWeight={600}>
                  Day {i + 1}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarMonthIcon fontSize="small" sx={{ color: "maroon" }} />
                  <Typography variant="body2">{day.date}</Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AccessTimeIcon fontSize="small" sx={{ color: "maroon" }} />
                  <Typography variant="body2">
                    {day.start_time} → {day.end_time} (
                    <b>{calcRenderedHours(day.start_time, day.end_time)} hrs</b>)
                  </Typography>
                </Box>
              </Box>
            ))
          ) : (
            <Typography>No schedule set.</Typography>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>
            Volunteers ({volunteers.length})
          </Typography>

          {volunteers.length === 0 ? (
            <Typography>No volunteers yet.</Typography>
          ) : (
            <Box sx={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={volunteers.map((v, index) => ({
                  id: v.id || index,
                  volunteer_id: v.id,
                  name: v.name,
                  hours: v.rendered_hours || 0,
                }))}
                columns={[
                  { field: "volunteer_id", headerName: "Volunteer ID", width: 150 },
                  { field: "name", headerName: "Name", flex: 1 },
                  { field: "hours", headerName: "Hours Rendered", width: 180 },
                ]}
                pageSizeOptions={[5, 10, 20]}
                initialState={{
                  pagination: { paginationModel: { pageSize: 5 } },
                }}
                disableRowSelectionOnClick
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* CANCEL DIALOG */}
      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)}>
        <DialogTitle>Cancel Event</DialogTitle>
        <DialogContent>Are you sure you want to cancel this event?</DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelOpen(false)}>No</Button>
          <Button onClick={confirmCancel} color="error" variant="contained">
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* RESTORE DIALOG */}
      <Dialog open={restoreOpen} onClose={() => setRestoreOpen(false)}>
        <DialogTitle>Restore Event</DialogTitle>
        <DialogContent>Do you want to restore this event?</DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreOpen(false)}>No</Button>
          <Button onClick={confirmRestore} color="success" variant="contained">
            Yes, Restore
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={restoreSuccessOpen}
        onClose={() => setRestoreSuccessOpen(false)}
      >
        <DialogTitle>Event Restored</DialogTitle>
        <DialogContent>
          The event has been successfully restored.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreSuccessOpen(false)}>OK</Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}
