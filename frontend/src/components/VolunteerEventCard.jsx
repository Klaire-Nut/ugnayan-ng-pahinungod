import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Chip,
  Box,
  LinearProgress,
  Divider,
  Button,
} from "@mui/material";

import { FaMapMarkerAlt, FaClock } from "react-icons/fa";
import EventJoinModal from "../pages/Volunteers/EventJoinModal";

/* ------------------------------------
   STATUS LOGIC
-------------------------------------- */
function getEventStatus(event) {
  const schedules = event.schedules || [];
  if (event.is_cancelled) return "CANCELLED";
  if (!schedules.length) return "UPCOMING";

  const now = new Date();
  const first = schedules[0];
  const last = schedules[schedules.length - 1];

  const start = new Date(`${first.date}T${first.start_time || first.time_start}`);
  const end = new Date(`${last.date}T${last.end_time || last.time_end}`);

  if (now < start) return "UPCOMING";
  if (now >= start && now <= end) return "HAPPENING";
  return "DONE";
}

const statusColors = {
  UPCOMING: "#0288d1",
  HAPPENING: "#2e7d32",
  DONE: "#6a1b9a",
  CANCELLED: "#c62828",
};

/* ------------------------------------
   HELPERS
-------------------------------------- */
function formatTime12hr(timeStr) {
  if (!timeStr) return "—";
  const [h, m] = timeStr.split(":");
  const d = new Date();
  d.setHours(h, m);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDatePretty(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    weekday: "short",
  });
}

/* ------------------------------------
   COMPONENT
-------------------------------------- */
export default function VolunteerEventCard({ event, isJoined, onOpen }) {
  const schedulesRaw = event.schedules || [];
  const token = localStorage.getItem("token");

  const [joined, setJoined] = useState(isJoined);
  const [joinOpen, setJoinOpen] = useState(false);

  const schedules = schedulesRaw.map((s) => ({
    ...s,
    start_time: s.start_time ?? s.time_start ?? null,
    end_time: s.end_time ?? s.time_end ?? null,
    max_slots: Number(s.max_slots ?? 0),
    filled_slots: Number(s.filled_slots ?? 0),
  }));

  const max = schedules.reduce((sum, s) => sum + s.max_slots, 0);
  const filled = schedules.reduce((sum, s) => sum + s.filled_slots, 0);
  const remaining = Math.max(0, max - filled);

  const status = getEventStatus({ ...event, schedules });

  /* ------------------------------------
     JOIN EVENT LOGIC (SAME AS DETAILS)
  -------------------------------------- */
  async function handleJoin(selectedSchedules) {
    const response = await fetch(
      "http://localhost:8000/api/events/volunteer/events/join/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          event: event.event_id,
          schedules: selectedSchedules,
          availability_orientation: false,
        }),
      }
    );

    if (response.ok) {
      alert("Successfully volunteered!");
      setJoined(true);
      setJoinOpen(false);
    } else {
      const err = await response.json();
      alert(err.error || "Failed to volunteer.");
    }
  }

  return (
    <Box sx={{ position: "relative" }}>

        <Card
            onClick={!event.is_cancelled ? onOpen : undefined}
            sx={{
                cursor: event.is_cancelled ? "not-allowed" : "pointer",
                opacity: event.is_cancelled ? 0.55 : 1,
                filter: event.is_cancelled ? "grayscale(80%)" : "none",
                borderRadius: 4,
                overflow: "hidden",
                boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
                transition: "0.25s ease",
                borderLeft: `6px solid ${statusColors[status]}`,
                "&:hover": {
                transform: event.is_cancelled ? "none" : "translateY(-4px)",
                },
            }}
        >

        <CardHeader
          title={
            <Typography sx={{ fontSize: "1.1rem", fontWeight: 700, color: "#222" }}>
              {event.event_name}
            </Typography>
          }
          subheader={
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Chip
                    label={status}
                    size="small"
                    sx={{
                        background: statusColors[status],
                        color: "white",
                        fontWeight: 700,
                        px: 1,
                        letterSpacing: 0.4,
                    }}
                />
            </Box>
          }
        />

        <CardContent sx={{ pt: 0, pb: 2.5 }}>
          {/* LOCATION */}
          <Box
            sx={{
              mb: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "#444",
            }}
          >
            <FaMapMarkerAlt size={15} style={{ color: "#b71c1c" }} />
            <Typography sx={{ fontSize: "0.95rem", fontWeight: 500 }}>
              {event.location}
            </Typography>
          </Box>

          {/* SCHEDULE */}
          <Box
            sx={{
              background: "#fafafa",
              border: "1px solid #eee",
              borderRadius: 2,
              p: 1.5,
              mb: 2,
            }}
          >
            {schedules.length === 0 ? (
              <Typography sx={{ fontSize: "0.9rem", color: "#777" }}>
                No schedule yet
              </Typography>
            ) : (
              schedules.map((day, i) => (
                <Box key={i} sx={{ mb: i < schedules.length - 1 ? 1.2 : 0 }}>
                  <Typography sx={{ fontWeight: 600, color: "#333", mb: 0.5 }}>
                    Day {i + 1} — {formatDatePretty(day.date)}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FaClock size={13} style={{ color: "#8c3434" }} />
                    <Typography sx={{ fontSize: "0.9rem", color: "#444" }}>
                      {formatTime12hr(day.start_time)} – {formatTime12hr(day.end_time)}
                    </Typography>
                  </Box>
                </Box>
              ))
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* VOLUNTEER SLOTS */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography sx={{ fontSize: "0.9rem", color: "#333" }}>
                <b>Volunteers:</b> {filled}/{max}
              </Typography>

              <LinearProgress
                variant="determinate"
                value={max ? (filled / max) * 100 : 0}
                sx={{ mt: 1, height: 8, borderRadius: 3 }}
              />
            </Box>

            <Typography sx={{ fontSize: "0.8rem", color: "#666", textAlign: "right" }}>
              {remaining} left
            </Typography>
          </Box>

          {/* JOIN BUTTON (NOW OPENS MODAL) */}
          {!event.is_cancelled && (
            <Button
              variant="contained"
              color={joined ? "success" : "primary"}
              fullWidth
              disabled={joined || event.is_full}
              sx={{ mt: 2, fontWeight: 600 }}
              onClick={(e) => {
                e.stopPropagation(); // prevent card click
                setJoinOpen(true);
              }}
            >
              {joined ? "VOLUNTEERED ✓" : event.is_full ? "FULL" : "VOLUNTEER"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* JOIN MODAL */}
      <EventJoinModal
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        schedules={schedules}
        onConfirm={handleJoin}
      />
    </Box>
  );
}
