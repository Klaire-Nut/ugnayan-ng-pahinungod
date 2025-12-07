import React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Chip,
  Box,
} from "@mui/material";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PlaceIcon from "@mui/icons-material/Place";
import GroupIcon from "@mui/icons-material/Group";

export default function VolunteerEventCard({ event, onOpen }) {
  const start = new Date(event.date_start);
  const end = new Date(event.date_end);

  const formatTime = (t) =>
    new Date(t).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  // Determine status by time
  const now = new Date();
  let status = "UPCOMING";
  if (now > end) status = "DONE";
  else if (now >= start && now <= end) status = "HAPPENING";

  const getStatusColor = () => {
    switch (status) {
      case "HAPPENING":
        return "success";
      case "UPCOMING":
        return "primary";
      case "DONE":
        return "info";
      default:
        return "default";
    }
  };

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
        subheader={
          <Chip
            label={status}
            color={getStatusColor()}
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

        {/* Date */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <AccessTimeIcon sx={{ fontSize: 18, mr: 1 }} />
          <Typography variant="body2">
            {formatDate(start)} — {formatTime(event.date_start)} to{" "}
            {formatTime(event.date_end)}
          </Typography>
        </Box>

        {/* Participants */}
        <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
          <GroupIcon sx={{ fontSize: 20, mr: 1 }} />
          <Typography variant="body2">
            {event.joined_count}/{event.max_participants} Volunteers
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
