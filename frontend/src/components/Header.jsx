import React from "react";
import { Link } from "react-router-dom";
import Button from "./Button";
import logo from "../assets/UNP Logo.png";
import { User } from "lucide-react";

function Header({ variant = "default" }) {
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
      {/* Left: Logo + Title */}
      <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
        <div style={styles.leftSection}>
          <img src={logo} alt="UNP Logo" style={styles.logo} />
          <div style={styles.title}>
            <div style={styles.subtitle}>
              University of the Philippines - Mindanao
            </div>
            <div style={styles.mainTitle}>UGNAYAN NG PAHINUNGOD</div>
          </div>
        </div>
      </Link>

      {/* Right: Navigation */}
      <div style={styles.rightSection}>
        {variant === "default" ? (
          <>
            {/* ✅ Fixed routes to match App.jsx */}
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

            <Link to="/login" style={{ textDecoration: "none" }}>
              <Button text="Login" variant="outlined" />
            </Link>
          </>
        ) : (
          <Link to="/profile" style={{ textDecoration: "none" }}>
            <Button type="icon" variant="secondary" icon={User} />
          </Link>
        )}
      </div>
    </header>
  );
}

export default Header;
