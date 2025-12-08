import React, { useState } from "react";
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

import { saveRole, login as adminLogin } from "../services/auth";
import { volunteerAPI } from "../services/volunteerApi";

export default function LoginPopup({ open, onClose, role }) {
  const [username, setUsername] = useState(""); // email for both
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      // ============================
      // ADMIN LOGIN
      // ============================
      if (role === "Admin") {
        const res = await adminLogin({
          role: "Admin",
          email: username,
          password,
        });

        console.log("ADMIN LOGIN SUCCESS:", res.data);

        // Save tokens
        localStorage.setItem("token", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);

        // Save role
        saveRole("admin");

        navigate("/admin/dashboard");
        onClose();
        return;
      }

      // ============================
      // VOLUNTEER LOGIN
      // ============================
      const response = await volunteerAPI.login(username, password);

      if (!response.success) {
        setErrorMessage(response.error || "Login failed");
        setLoading(false);
        return;
      }

      console.log("VOLUNTEER LOGIN SUCCESS:", response.data);

      if (response.data.token) {
        localStorage.setItem("volunteerToken", response.data.token);
      }

      saveRole("Volunteer");

      if (response.data.volunteer) {
        localStorage.setItem("volunteer", JSON.stringify(response.data.volunteer));
      }

      navigate("/volunteer/dashboard", {
        state: { volunteer: response.data.volunteer },
      });

      onClose();
      
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setErrorMessage(
        err.response?.data?.error || "Login failed. Check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) handleLogin();
  };

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
            label="Email"
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
              }}
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </Box>

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
