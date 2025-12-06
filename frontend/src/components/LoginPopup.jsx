import React from "react";
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
import { login as adminLogin, volunteerLogin, getCurrentUser } from "../services/auth";

export default function LoginPopup({ open, onClose, role }) {

  // State variables for the username/email and password
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  const navigate = useNavigate();

// Admin login handler
const handleLogin = async () => {
  if (!username || !password) {
    setErrorMessage("Please enter username and password.");
    return;
  }

  try {
    let res;

    if (role === "Admin") {
      // Step 1: Call login API
      res = await adminLogin({ username, password });

      // Step 2: Use the returned user directly
      console.log("Logged in admin:", res.data.user);

      // Step 3: Clear error, close popup, navigate
      setErrorMessage("");
      onClose();
      navigate("/admin/dashboard");

    } else {
      // Volunteer login
      res = await volunteerLogin({ email: username, password });
      console.log("Volunteer login response:", res.data);

      setErrorMessage("");
      onClose();
      navigate("/dashboard");
    }
  } catch (err) {
    console.error("Login error:", err.response?.data || err.message);
    setErrorMessage(
      "Login failed. Check your username/email and password."
    );
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
        {role === "Admin" ? "Admin Login" : "Volunteer Login"}
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
            {role === "Volunteer" ? (
              <>
                Don&apos;t have an account?{" "}
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
              </>
            ) : (
              "For authorized admins only."
            )}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}