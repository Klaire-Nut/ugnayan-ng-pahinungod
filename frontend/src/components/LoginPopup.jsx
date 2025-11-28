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
import { login as adminLogin, volunteerLogin } from "../services/auth";

export default function LoginPopup({ open, onClose, role }) {
  // State variables
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  const navigate = useNavigate();

    // Admin login handler
   const handleLogin = async () => {
    try {
      let res;
      if (role === "Admin") {
        res = await adminLogin({ username, password }); // Admin uses username
        navigate("/admin/dashboard");
      } else {
        res = await volunteerLogin({ email: username, password }); // Volunteer uses email
        navigate("/dashboard"); // Volunteer dashboard route
      }
      console.log(res.data); // optional: backend returns user info
      setErrorMessage("");
      onClose(); // close the popup
    } catch (err) {
      console.error(err.response?.data);
      setErrorMessage("Login failed. Check your username/email and password.");
    }
  };

      if (res.data.message === "Login successful!") {
        // If login is successful, handle the response
        setErrorMessage(""); // Clear any previous error messages
        onClose(); // Close the login popup
        navigate("/dashboard"); // Navigate to a dashboard or home page after successful login
      }
    } catch (err) {
      console.error(err.response?.data);
      setErrorMessage("Login failed. Check your email and password.");
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
      <DialogTitle sx={{ textAlign: "center", color: "#7B1113", fontWeight: 600 }}>
        {role === "Admin" ? "Admin Login" : "Volunteer Login"}
      </DialogTitle>

      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            size="small"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            <Typography variant="body2" color="error" textAlign="center" sx={{ mt: 1 }}>
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
