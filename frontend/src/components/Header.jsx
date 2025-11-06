import React from "react";
import Button from "./Button";
import logo from "../assets/UNP Logo.png";
import { User } from "lucide-react";
import { Link } from "react-router-dom";

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
    link: {
      textDecoration: "none",
      color: "inherit",
    },
  };

  return (
    <header style={styles.container}>
      <div style={styles.leftSection}>
        <img src={logo} alt="UNP Logo" style={styles.logo} />
        <div style={styles.title}>
          <div style={styles.subtitle}>
            University of the Philippines - Mindanao
          </div>
          <div style={styles.mainTitle}>UGNAYAN NG PAHINUNGOD</div>
        </div>
      </div>

      <div style={styles.rightSection}>
        {variant === "default" ? (
          <>
            <Link to="/about" style={styles.link}>
              <Button text="About Us" variant="text" />
            </Link>
            <Link to="/events" style={styles.link}>
              <Button text="Events" variant="text" />
            </Link>
            <Link to="/register" style={styles.link}>
              <Button text="Register" variant="text" />
            </Link>
            <Link to="/login" style={styles.link}>
              <Button text="Login" variant="outlined" />
            </Link>
          </>
        ) : (
          <Button type="icon" variant="secondary" icon={User} />
        )}
      </div>
    </header>
  );
}

export default Header;
