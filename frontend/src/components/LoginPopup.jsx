import React from "react";
import { Dialog, DialogTitle, DialogContent, TextField, Button, Box, Typography } from "@mui/material";

export default function LoginPopup({ open, onClose, role }) {
  const handleLogin = () => {
    console.log(`${role} logged in`);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "16px",
          padding: 2,
          width: "350px",
          bgcolor: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          color: "#7B1113",
          fontWeight: 600,
        }}
      >
        {role === "Admin" ? "Admin Login" : "Volunteer Login"}
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField label="Email" type="email" fullWidth variant="outlined" size="small" />
          <TextField label="Password" type="password" fullWidth variant="outlined" size="small" />

          <Button
            variant="contained"
            sx={{
              bgcolor: "#7B1113",
              color: "white",
              borderRadius: "8px",
              textTransform: "none",
              "&:hover": { bgcolor: "#8C1B1F" },
            }}
            onClick={handleLogin}
          >
            Log In
          </Button>

          <Typography
            variant="body2"
            textAlign="center"
            sx={{ mt: 1, color: "#555" }}
          >
            {role === "Volunteer"
              ? "Don't have an account? Register now."
              : "For authorized admins only."}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
