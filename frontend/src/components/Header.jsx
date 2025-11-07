import React, { useState } from "react";
import Button from "./Button";
import logo from "../assets/UNP Logo.png";
import { User } from "lucide-react";
import { Menu, MenuItem, Box } from "@mui/material";
import LoginPopup from "./LoginPopup";

function Header({ variant = "default" }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [popupRole, setPopupRole] = useState(null); // ✅ state for popup role
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // ✅ show popup when Admin/Volunteer clicked
  const handleOpenPopup = (role) => {
    setPopupRole(role);
    handleClose();
  };

  // ✅ close popup
  const handleClosePopup = () => setPopupRole(null);

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
      gap: "1rem",
    },
  };

  return (
    <header style={styles.container}>
      <div style={styles.leftSection}>
        <img src={logo} alt="UNP Logo" style={styles.logo} />
        <div style={styles.title}>
          <div style={styles.subtitle}>University of the Philippines - Mindanao</div>
          <div style={styles.mainTitle}>UGNAYAN NG PAHINUNGOD</div>
        </div>
      </div>

      <div style={styles.rightSection}>
        {variant === "default" ? (
          <>
            <Button text="Events" variant="text" />
            <Button text="Register" variant="text" />

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
                    fontWeight: 500,
                    borderRadius: "8px",
                    p: 0.5,
                    "&:hover": { bgcolor: "#007BFF", color: "white" },
                    fontWeight: 600,
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
                    fontWeight: 500,
                    borderRadius: "8px",
                    p: 0.5,
                    "&:hover": { bgcolor: "#007BFF", color: "white" },
                    fontWeight: 600,
                  }}
                >
                  Volunteer
                </MenuItem>
              </Menu>
            </Box>
          </>
        ) : (
          <Button type="icon" variant="secondary" icon={User} />
        )}
      </div>

      {/* ✅ POPUP (for Admin/Volunteer login) */}
      <LoginPopup
        open={Boolean(popupRole)}
        onClose={handleClosePopup}
        role={popupRole}
      />
    </header>
  );
}

export default Header;