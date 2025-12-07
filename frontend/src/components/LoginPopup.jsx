import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Import admin login function
import { login as adminLogin, volunteerLogin } from "../services/auth";
import { saveRole } from "../services/auth";

export default function LoginPopup({ open, onClose, role }) {

  // State variables for the username/email and password
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  const navigate = useNavigate();

  // Reset fields whenever popup is opened
  useEffect(() => {
    if (open) {
      setUsername("");
      setPassword("");
      setErrorMessage("");
    }
  }, [open]);

  // ---------- ADMIN LOGIN ----------
  const handleLogin = async () => {
    if (!username || !password) {
      setErrorMessage("Please enter username and password.");
      return;
    }

    try {
      const res = await adminLogin({ username, password });

      console.log("LOGIN RESPONSE:", res.data);

      // Django auth success → ALWAYS returns user + sets sessionid cookie
      if (res.data?.message === "Login successful" || res.data?.user) {
        saveRole("admin");           // Allow protected admin routes
        onClose();                   // Close modal
        navigate("/admin/dashboard", { replace: true }); // Prevent going back
        return;
      }

      // If no user returned = invalid credentials
      setErrorMessage("Invalid login credentials.");
      
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      setErrorMessage("Login failed. Please check your username and password.");
    }
  };



// Volunteer Registration Function
  const handleRegister = () => {
    onClose();
    navigate("/register");
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
        Admin Login
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Username"
            type="text"
            fullWidth
            variant="outlined"
            size="small"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            size="small"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {errorMessage && (
            <Typography color="error" variant="body2">
              {errorMessage}
            </Typography>
          )}

          <Box display="flex" justifyContent="space-between" gap={1}>
            <Button
              variant="contained"
              sx={{
                bgcolor: "#7B1113",
                color: "white",
                borderRadius: "8px",
                textTransform: "none",
                "&:hover": { bgcolor: "#8C1B1F" },
                flex: 1,
              }}
              onClick={handleLogin}
            >
              Log In
            </Button>

            <Button
              variant="outlined"
              sx={{
                borderColor: "#7B1113",
                color: "#7B1113",
                borderRadius: "8px",
                textTransform: "none",
                flex: 1,
                "&:hover": { bgcolor: "#fbeaea", borderColor: "#8C1B1F" },
              }}
              onClick={onClose}
            >
              Cancel
            </Button>
          </Box>

          <Typography
            variant="body2"
            textAlign="center"
            sx={{ mt: 1, color: "#555" }}
          >
            For authorized admins only.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}