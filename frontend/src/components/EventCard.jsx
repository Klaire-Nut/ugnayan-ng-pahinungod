import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Typography,
  Chip,
  Box,
  LinearProgress,
  Divider,
  Tooltip,
} from "@mui/material";

import { FaMapMarkerAlt, FaClock, FaBan } from "react-icons/fa";
import { FiEdit3 } from "react-icons/fi";

/* ------------------------------------
   STATUS LOGIC
-------------------------------------- */
function getStatus(event) {
  const schedules = event.schedules || [];

  if (event.is_cancelled) return "CANCELLED";
  if (!schedules.length) return "UPCOMING";

  const now = new Date();
  const first = schedules[0];
  const last = schedules[schedules.length - 1];

  const start = new Date(`${first.date}T${first.start_time}`);
  const end = new Date(`${last.date}T${last.end_time}`);

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
  if (!timeStr) return "";
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
   EVENT CARD (NO RIBBON)
-------------------------------------- */
export default function EventCard({ event, onEdit, onOpen }) {
  const schedules = event.schedules || [];

  // TOTAL SLOTS = SUM OF ALL DAY SLOTS
  const max = schedules.reduce((sum, s) => sum + Number(s.max_slots || 0), 0);

  // TOTAL VOLUNTEERS JOINED ACROSS ALL DAYS
  const joined = schedules.reduce((sum, s) => sum + Number(s.filled_slots || 0), 0);

  // REMAINING SLOTS
  const remaining = max - joined;
  const status = getStatus(event);
  const isCancelled = event.is_cancelled;

  return (
    <Box sx={{ position: "relative" }}>
      <Card
        onClick={onOpen}
        sx={{
          borderRadius: 4,
          cursor: "pointer",
          overflow: "hidden",
          boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
          transition: "0.25s ease",
          opacity: isCancelled ? 0.65 : 1,
          borderLeft: `6px solid ${statusColors[status]}`,
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
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
            <Chip
              icon={
                status === "CANCELLED" ? (
                  <FaBan style={{ color: "white", marginLeft: -4 }} />
                ) : undefined
              }
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
          }
          action={
            <Tooltip title={isCancelled ? "Cannot edit cancelled event" : "Edit event"}>
              <span>
                <IconButton
                  disabled={isCancelled}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isCancelled) onEdit(event);
                  }}
                >
                  <FiEdit3 size={18} />
                </IconButton>
              </span>
            </Tooltip>
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
                <b>Volunteers:</b> {joined}/{max}
              </Typography>

              <LinearProgress
                variant="determinate"
                value={max ? (joined / max) * 100 : 0}
                sx={{ mt: 1, height: 8, borderRadius: 3 }}
              />
            </Box>

            <Typography sx={{ fontSize: "0.8rem", color: "#666", textAlign: "right" }}>
              {remaining} left
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
