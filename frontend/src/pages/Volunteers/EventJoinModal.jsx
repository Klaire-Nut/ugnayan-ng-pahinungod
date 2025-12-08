import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
  Paper,
} from "@mui/material";

import { FaCalendarAlt, FaClock } from "react-icons/fa";

// ----- Helper Formatters -----
const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatTime = (timeStr) => {
  if (!timeStr) return "—";
  const [hour, minute] = timeStr.split(":");
  const d = new Date();
  d.setHours(hour, minute);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function EventJoinModal({
  open,
  onClose,
  schedules = [],
  onConfirm,
}) {
  const [selected, setSelected] = useState([]);

  const toggleSelection = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    if (!selected.length) return;
    onConfirm(selected);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "14px",
          paddingBottom: 1,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1.5 }}>
        Select Your Volunteer Schedule
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        <Typography sx={{ mb: 2, color: "#555", fontSize: "0.95rem" }}>
          Choose one or multiple available schedules. Your availability will help
          coordinators assign tasks appropriately.
        </Typography>

        {schedules.length === 0 && (
          <Typography sx={{ color: "#999", mt: 1 }}>
            No schedules available for this event.
          </Typography>
        )}

        {schedules.map((sch, index) => {
          const id = sch.schedule_id || sch.id || index;

          return (
            <Paper
              key={id}
              elevation={selected.includes(id) ? 3 : 0}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                border: selected.includes(id)
                  ? "2px solid #1976d2"
                  : "1px solid #e0e0e0",
                cursor: "pointer",
                transition: "0.2s",
                "&:hover": {
                  borderColor: "#1976d2",
                  backgroundColor: "#f9fcff",
                },
                display: "flex",
                alignItems: "flex-start",
                gap: 1.5,
              }}
              onClick={() => toggleSelection(id)}
            >
              {/* Checkbox */}
              <Checkbox
                checked={selected.includes(id)}
                onChange={() => toggleSelection(id)}
                sx={{ mt: 0.5 }}
              />

              {/* Schedule Info */}
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                  Day {index + 1}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                  <FaCalendarAlt
                    size={14}
                    style={{ marginRight: 8, color: "#7b1d1d" }}
                  />
                  <Typography sx={{ fontSize: "0.95rem" }}>
                    {formatDate(sch.date)}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FaClock
                    size={14}
                    style={{ marginRight: 8, color: "#7b1d1d" }}
                  />
                  <Typography sx={{ fontSize: "0.95rem" }}>
                    {formatTime(sch.start_time)} – {formatTime(sch.end_time)}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          );
        })}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Cancel
        </Button>

        <Button
          variant="contained"
          disabled={!selected.length}
          onClick={handleConfirm}
          sx={{
            textTransform: "none",
            px: 3,
            borderRadius: "8px",
          }}
        >
          Confirm Selection
        </Button>
      </DialogActions>
    </Dialog>
  );
}
