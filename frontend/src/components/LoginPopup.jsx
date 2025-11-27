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
// Component for the Admin Auth
import { login } from "../services/auth";

export default function LoginPopup({ open, onClose, role }) {

  // State variables for the username/email and password
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  const navigate = useNavigate();

  // Login Function to call Django
  const handleLogin = async () => {
  try {
    const res = await login({ username, password }); // send credentials to backend
    console.log(res.data); // contains user info
    setErrorMessage(""); // clear errors
    onClose(); // close the popup
  } catch (err) {
    console.error(err.response?.data);
    setErrorMessage("Login failed. Check your username and password.");
  }
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