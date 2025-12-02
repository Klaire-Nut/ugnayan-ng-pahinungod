import React, { useState } from "react";
import { User } from "lucide-react";
import { IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogActions, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth";

export default function VolunteerHeader() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutModal, setLogoutModal] = useState(false);
  const open = Boolean(anchorEl);

  const handleUserClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleProfile = () => {
    handleMenuClose();
    navigate("/volunteer/profile");
  };

  const handleLogoutClick = () => {
    handleMenuClose();
    setLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    try { await logout(); } catch (err) { console.error(err); }
    navigate("/", { replace: true });
  };

  return (
    <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', height:'60px', padding:'0 20px', background:'#7B1113', color:'#fff' }}>
      <div className="title">
        <div className="sub">University of the Philippines - Mindanao</div>
        <div className="main">UGNAYAN NG PAHINUNGOD</div>
      </div>

      {/* User Icon */}
      <Box>
        <IconButton sx={{ color:'white' }} onClick={handleUserClick}><User /></IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
          PaperProps={{ sx:{ mt:0.5, minWidth:140, textAlign:'center', borderRadius:1 } }}
        >
          <MenuItem onClick={handleProfile} sx={{ justifyContent:'center', color:'#7B1113', fontWeight:600 }}>Profile</MenuItem>
          <MenuItem onClick={handleLogoutClick} sx={{ justifyContent:'center', color:'#7B1113', fontWeight:600 }}>Logout</MenuItem>
        </Menu>
      </Box>

      {/* Logout Confirmation Modal */}
      <Dialog open={logoutModal} onClose={() => setLogoutModal(false)}>
        <DialogTitle>Are you sure you want to log out?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setLogoutModal(false)} color="primary">Back</Button>
          <Button onClick={handleConfirmLogout} color="error">Logout</Button>
        </DialogActions>
      </Dialog>
    </header>
  );
}
