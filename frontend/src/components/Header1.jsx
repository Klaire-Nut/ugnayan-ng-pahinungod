import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "./Button";
import logo from "../assets/UNP Logo.png";
import { User } from "lucide-react";
import { Menu, MenuItem, Box, IconButton } from "@mui/material";
import LoginPopup from "./LoginPopup";

function Header({ variant = "default", isLoggedIn = false, onLogout }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [popupRole, setPopupRole] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleOpenPopup = (role) => {
    setPopupRole(role);
    handleClose();
  };
  const handleClosePopup = () => setPopupRole(null);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    handleClose();
  };

  const styles = {
    container: {
      width: "100%",
      backgroundColor: "#7B1113",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0.5rem 2rem",
      boxSizing: "border-box",
      position: "sticky",
      top: 0,
      zIndex: 50,
    },
    leftSection: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    },
    logo: {
      height: "40px",
      width: "40px",
      objectFit: "contain",
    },
    title: {
      fontFamily: "Georgia, serif",
      lineHeight: "1.2",
    },
    subtitle: {
      fontSize: "0.85rem",
      fontWeight: "400",
    },
    mainTitle: {
      fontSize: "1.2rem",
      fontWeight: "400",
      letterSpacing: "0.5px",
    },
    rightSection: {
      display: "flex",
      alignItems: "center",
      gap: "1.25rem",
    },
  };

  return (
    <header style={styles.container}>
      {/* Left Section */}
      <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
        <div style={styles.leftSection}>
          <div style={styles.title}>
            <div style={styles.subtitle}>
              University of the Philippines - Mindanao
            </div>
            <div style={styles.mainTitle}>UGNAYAN NG PAHINUNGOD</div>
          </div>
        </div>
      </Link>

      {/* Right Section */}
      <div style={styles.rightSection}>
        {!isLoggedIn ? (
          <>
            <Link to="/" style={{ textDecoration: "none" }}>
              <Button text="Home" variant="text" />
            </Link>
            <Link to="/about" style={{ textDecoration: "none" }}>
              <Button text="About Us" variant="text" />
            </Link>
            <Link to="/events" style={{ textDecoration: "none" }}>
              <Button text="Events" variant="text" />
            </Link>
            <Link to="/register" style={{ textDecoration: "none" }}>
              <Button text="Register" variant="text" />
            </Link>

            {/* LOGIN DROPDOWN */}
            <Box>
              <Button text="Login" variant="outlined" onClick={handleClick} />
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                disableScrollLock={true}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "center",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "center",
                }}
                PaperProps={{
                  sx: {
                    mt: 0.3,
                    bgcolor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "12px",
                    boxShadow: "0 3px 10px rgba(0, 0, 0, 0.15)",
                    backdropFilter: "blur(10px)",
                    overflow: "hidden",
                    width: 135,
                    textAlign: "center",
                    p: 0.9,
                    minHeight: "auto",
                  },
                }}
              >
                <MenuItem
                  onClick={() => handleOpenPopup("Admin")}
                  sx={{
                    justifyContent: "center",
                    textAlign: "center",
                    color: "#7B1113",
                    fontWeight: 600,
                    borderRadius: "8px",
                    p: 0.5,
                    "&:hover": { bgcolor: "#007BFF", color: "white" },
                  }}
                >
                  Admin
                </MenuItem>
                <MenuItem
                  onClick={() => handleOpenPopup("Volunteer")}
                  sx={{
                    justifyContent: "center",
                    textAlign: "center",
                    color: "#7B1113",
                    fontWeight: 600,
                    borderRadius: "8px",
                    p: 0.5,
                    "&:hover": { bgcolor: "#007BFF", color: "white" },
                  }}
                >
                  Volunteer
                </MenuItem>
              </Menu>
            </Box>
          </>
        ) : (
          <Box>
            <IconButton onClick={handleProfileClick} sx={{ color: "white" }}>
              <User />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              disableScrollLock={true}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem onClick={() => { handleClose(); window.location.href = "/profile"; }}>
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
            </Menu>
          </Box>
        )}
      </div>

      {/* LOGIN POPUP */}
      <LoginPopup
        open={Boolean(popupRole)}
        onClose={handleClosePopup}
        role={popupRole}
      />
    </header>
  );
}

export default Header;
