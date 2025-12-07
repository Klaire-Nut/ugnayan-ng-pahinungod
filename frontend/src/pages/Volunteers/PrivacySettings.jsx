import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Divider,
} from "@mui/material";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import NotificationModal from "../../components/NotificationModal";
import axios from "axios";

export default function VolunteerPrivacySettings() {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [notif, setNotif] = useState({
    open: false,
    type: "success",
    message: "",
  });

  const showNotif = (type, message) => {
    setNotif({ open: true, type, message });
  };

  // -----------------------------------------------------
  // 🔐 VOLUNTEER PASSWORD CHANGE API CALL
  // -----------------------------------------------------
  const handleChangePassword = async () => {
    if (!oldPass || !newPass || !confirmPass) {
      showNotif("error", "Please fill in all fields.");
      return;
    }

    if (newPass !== confirmPass) {
      showNotif("error", "New passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/volunteers/change-password/",
        {
          current_password: oldPass,
          new_password: newPass,
          confirm_password: confirmPass,
        },
        { withCredentials: true } // IMPORTANT
      );

      showNotif("success", response.data.message || "Password changed!");

      // Reset fields
      setOldPass("");
      setNewPass("");
      setConfirmPass("");

    } catch (error) {
      const errMsg =
        error.response?.data?.error || "Failed to change password.";

      showNotif("error", errMsg);
    }
  };

  return (
    <Box sx={{ width: "100%", p: 4 }}>
      {/* PAGE HEADER */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "700", color: "#7b1d1d" }}>
          Privacy Settings
        </Typography>
        <Typography sx={{ color: "#555", mt: 0.5 }}>
          Manage your volunteer account security.
        </Typography>
      </Box>

      {/* CARD */}
      <Box sx={{ display: "flex", justifyContent: "flex-start", width: "100%" }}>
        <Card
          sx={{
            width: "100%",
            maxWidth: 520,
            borderRadius: "16px",
            p: 1,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <FaLock size={20} color="#7b1d1d" />
              <Typography variant="h6" fontWeight="bold" sx={{ ml: 1 }}>
                Change Password
              </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* FORM */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                type={showOld ? "text" : "password"}
                label="Current Password"
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowOld(!showOld)}>
                        {showOld ? <FaEyeSlash /> : <FaEye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                type={showNew ? "text" : "password"}
                label="New Password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowNew(!showNew)}>
                        {showNew ? <FaEyeSlash /> : <FaEye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                type={showConfirm ? "text" : "password"}
                label="Confirm New Password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm(!showConfirm)}>
                        {showConfirm ? <FaEyeSlash /> : <FaEye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* BUTTON */}
            <Button
              variant="contained"
              onClick={handleChangePassword}
              fullWidth
              sx={{
                mt: 4,
                py: 1.4,
                backgroundColor: "#7b1d1d",
                borderRadius: "10px",
                fontWeight: "bold",
                textTransform: "none",
                "&:hover": { backgroundColor: "#5e1414" },
              }}
            >
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </Box>

      <NotificationModal
        open={notif.open}
        type={notif.type}
        message={notif.message}
        onClose={() => setNotif({ ...notif, open: false })}
      />
    </Box>
  );
}
