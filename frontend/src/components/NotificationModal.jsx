import React from "react";
import {
  Modal,
  Box,
  Typography,
  Button,
  Fade,
  IconButton,
} from "@mui/material";

import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";

export default function NotificationModal({
  open,
  onClose,
  type = "success",
  message = "",
}) {
  const ICONS = {
    success: { icon: <FaCheckCircle size={38} />, color: "#2e7d32", title: "Success" },
    error: { icon: <FaTimesCircle size={38} />, color: "#c62828", title: "Error" },
    warning: { icon: <FaExclamationTriangle size={38} />, color: "#ed6c02", title: "Warning" },
    info: { icon: <FaInfoCircle size={38} />, color: "#1565c0", title: "Notice" },
  };

  const { icon, color, title } = ICONS[type] ?? ICONS.info;

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition>
      <Fade in={open}>
        <Box
          sx={{
            p: 4,
            width: 420,
            bgcolor: "#ffffff",
            borderRadius: "18px",
            mx: "auto",
            mt: "18vh",
            boxShadow: "0 8px 30px rgba(0,0,0,0.18)",
            textAlign: "center",
            outline: "none",
            transformOrigin: "center",
          }}
        >
          {/* ICON WRAPPER */}
          <Box sx={{ mb: 1, color }}>{icon}</Box>

          {/* TITLE */}
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, mb: 1, color: "#333" }}
          >
            {title}
          </Typography>

          {/* MESSAGE */}
          <Typography
            sx={{
              color: "#666",
              mb: 3,
              fontSize: "0.95rem",
              lineHeight: 1.4,
              px: 1,
            }}
          >
            {message}
          </Typography>

          {/* ACTION BUTTON */}
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#7b1d1d",
              "&:hover": { backgroundColor: "#5e1414" },
              px: 5,
              py: 1,
              fontWeight: 600,
              borderRadius: "10px",
              textTransform: "capitalize",
            }}
            onClick={onClose}
          >
            OK
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
}
