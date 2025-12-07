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
import { saveRole } from "../services/auth";
import { volunteerAPI } from "../services/volunteerApi";  // ⭐ FIX: Use volunteerAPI
import { login as adminLogin } from "../services/auth";    // Keep admin login separate


export default function LoginPopup({ open, onClose, role }) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      if (role === "Admin") {
        // ⭐ Admin login uses auth.js (separate system)
        const res = await adminLogin({
          role: "Admin",
          username,
          password,
        });

        console.log("✅ ADMIN LOGIN SUCCESS:", res.data);
        navigate("/admin/dashboard");

      } else {
        // ⭐ Volunteer login uses volunteerAPI (session-based)
        const response = await volunteerAPI.login(username, password);

        if (!response.success) {
          setErrorMessage(response.error || "Login failed");
          setLoading(false);
          return;
        }

        console.log("✅ VOLUNTEER LOGIN SUCCESS:", response.data);
        
        // Optional: Store volunteer data in localStorage
        if (response.data.volunteer) {
          localStorage.setItem("volunteer", JSON.stringify(response.data.volunteer));
        }

        navigate("/volunteer/dashboard");
      }

      onClose();

    } catch (err) {
      console.error("❌ LOGIN ERROR:", err);
      setErrorMessage(
        err.response?.data?.error || 
        "Login failed. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    onClose();
    navigate("/register");
  };

  // Allow Enter key to submit
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleLogin();
    }
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
          <TextField
            label={role === "Admin" ? "Username" : "Email"}
            type="text"
            fullWidth
            size="small"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            autoFocus
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            size="small"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />

          {errorMessage && (
            <Typography color="error" textAlign="center" sx={{ mt: 1 }}>
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
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
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
              disabled={loading}
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
          {role === "Volunteer" && (
            <Typography textAlign="center" sx={{ mt: 1, color: "#555" }}>
              Don't have an account?{" "}
              <span
                onClick={handleRegister}
                style={{
                  color: "#7B1113",
                  fontWeight: 500,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Register now.
              </span>
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}