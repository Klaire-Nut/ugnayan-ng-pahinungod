import React from "react";
import Button from "./Button";
import logo from "../assets/UNP Logo.png"; // adjust path if needed
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
      fontWeight: "400", // not bold
    },
    mainTitle: {
      fontSize: "1.2rem",
      fontWeight: "400", // not bold
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
            <Button text="Login" variant="outlined" />
          </>
        ) : (
          <Button type="icon" variant="secondary" icon={User} />
        )}
      </div>
    </header>
  );
}

export default Header;