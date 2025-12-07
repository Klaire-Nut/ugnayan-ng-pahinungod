// src/components/AdminHeader.jsx
import React, { useState } from "react";
import { User } from "lucide-react";
import { IconButton, Dialog, DialogTitle, DialogActions, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { logout, removeRole } from "../services/auth";

export default function AdminHeader() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleLogoutClick = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleLogout = async () => {
    try {
      await logout();      // API logout
      removeRole();        // Clear admin role from localStorage
      setSnackbarOpen(true); // Show success notification
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setOpen(false);      // Close the confirmation dialog
      navigate("/", { replace: true }); // redirect to login/home
    }
  };

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      width: '100%', height: '60px', padding: '0 20px', color: '#fff'
    }}>
      <div className="title">
        <div className="sub">University of the Philippines - Mindanao</div>
        <div className="main">UGNAYAN NG PAHINUNGOD</div>
      </div>

      <IconButton sx={{ color: 'white' }} onClick={handleLogoutClick}>
        <User />
      </IconButton>

      {/* Logout Modal */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Are you sure you want to log out?</DialogTitle>
        <DialogActions>
          <Button onClick={handleClose} color="primary">Back</Button>
          <Button onClick={handleLogout} color="error">Logout</Button>
        </DialogActions>
      </Dialog>
    </header>
  );
}
