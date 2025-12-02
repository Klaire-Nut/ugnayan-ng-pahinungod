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
import { login } from "../services/auth";

export default function LoginPopup({ open, onClose, role }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await login({ email, password, role });
      console.log(res.data);

      if (res.data.message === "Login successful!" || res.data.message === "Login successful") {
        setErrorMessage("");
        onClose();

        // 🔥 FINAL FIX
        if (role === "Admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/volunteer/dashboard");
        }
      }
    } catch (err) {
      console.error(err.response?.data);
      setErrorMessage(
        err.response?.data?.message || "Login failed. Check credentials."
      );
    }
  };

  const handleRegister = () => {
    onClose();
    navigate("/register");
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {role === "Admin" ? "Admin Login" : "Volunteer Login"}
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {errorMessage && (
            <Typography color="error" textAlign="center">
              {errorMessage}
            </Typography>
          )}

          <Box display="flex" gap={1}>
            <Button onClick={handleLogin}>Log In</Button>
            <Button onClick={onClose}>Cancel</Button>
          </Box>

          {role === "Volunteer" && (
            <Typography textAlign="center">
              Don't have an account?{" "}
              <span
                style={{ color: "blue", cursor: "pointer" }}
                onClick={handleRegister}
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
