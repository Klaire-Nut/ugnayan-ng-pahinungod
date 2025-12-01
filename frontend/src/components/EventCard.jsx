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
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlaceIcon from "@mui/icons-material/Place";

export default function EventCard({ event, onEdit, onDelete, onOpen }) {
  const schedules = event.schedules || [];

  const getStatus = () => {
    // If event was manually cancelled
    if (event.status === "CANCELLED") return "CANCELLED";

    if (!schedules.length) return "UPCOMING";

    const now = new Date();
    const first = new Date(schedules[0].date);
    const last = new Date(schedules[schedules.length - 1].date);

    if (now < first) return "UPCOMING";
    if (now >= first && now <= last) return "HAPPENING";
    if (now > last) return "DONE";

    return "UPCOMING";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "HAPPENING":
        return "success";
      case "UPCOMING":
        return "primary";
      case "DONE":
        return "info";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const status = getStatus();

  const volunteered = event.volunteered || 0;
  const needed = event.volunteers_needed || 0;

  return (
    <Card
      onClick={onOpen}
      sx={{
        cursor: "pointer",
        borderLeft: `6px solid`,
        borderColor:
          status === "UPCOMING"
            ? "#0277bd"
            : status === "HAPPENING"
            ? "#2e7d32"
            : "#6a1b9a",
        borderRadius: 3,
        boxShadow: 4,
        "&:hover": { boxShadow: 7 },
      }}
    >
      <CardHeader
        title={event.event_name}
        action={
          <>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                // prevent editing cancelled events (still block here)
                if (event.status !== "CANCELLED") onEdit(event);
              }}
              disabled={event.status === "CANCELLED"}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onDelete(event.id);
              }}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </>
        }
        subheader={
          <Chip
            label={status}
            color={getStatusColor(status)}
            size="small"
            sx={{ fontWeight: "bold" }}
          />
        }
      />

      <CardContent>
        {/* Location */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <PlaceIcon sx={{ fontSize: 18, mr: 1 }} />
          <Typography variant="body2">{event.location}</Typography>
        </Box>

        {/* Date Range */}
        {schedules.length > 0 && (
          <Chip
            icon={<AccessTimeIcon />}
            label={`${formatDate(schedules[0].date)} → ${formatDate(
              schedules[schedules.length - 1].date
            )}`}
            sx={{ mb: 2 }}
          />
        )}

        <Divider sx={{ mb: 1 }} />

        {/* Day by day display */}
        {schedules.map((d, i) => (
          <Box key={i} sx={{ mb: 1 }}>
            <Typography variant="body2" fontWeight="600">
              Day {i + 1}
            </Typography>
            <Typography variant="body2">
              {formatDate(d.date)} — {d.start_time} → {d.end_time}
            </Typography>
          </Box>
        ))}

        <Divider sx={{ my: 2 }} />

        {/* Volunteers */}
        <Typography variant="body2">
          <strong>Volunteers:</strong> {volunteered}/{needed}
        </Typography>

        <LinearProgress
          variant="determinate"
          value={needed ? (volunteered / needed) * 100 : 0}
          sx={{ height: 8, borderRadius: 20, mt: 1 }}
        />

        <Typography variant="caption" sx={{ float: "right", mt: 1 }}>
          {needed - volunteered} remaining
        </Typography>
      </CardContent>
    </Card>
  );
}
