import React from "react";
import logo from "../assets/UNP Logo.png"; // replace with correct UP Mindanao logo path

function Footer() {
  const styles = {
    container: {
      backgroundColor: "#7B1113",
      color: "white",
      textAlign: "center",
      padding: "3rem 1rem 1.5rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily: "Georgia, serif",
    },
    logoSection: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      marginBottom: "2rem",
    },
    logo: {
      width: "50px",
      height: "50px",
      objectFit: "contain",
    },
    titleSection: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    upTitle: {
      fontSize: "1rem",
      letterSpacing: "0.5px",
    },
    upMindanao: {
      fontWeight: "bold",
      letterSpacing: "1px",
    },
    linksContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "2rem",
      width: "100%",
      maxWidth: "1000px",
      marginBottom: "2.5rem",
      textAlign: "center",
    },
    column: {
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    },
    heading: {
      fontWeight: "600",
      fontSize: "0.95rem",
      marginBottom: "0.5rem",
      letterSpacing: "0.5px",
    },
    link: {
      fontSize: "0.85rem",
      color: "white",
      textDecoration: "none",
      transition: "color 0.2s ease",
    },
    copyright: {
      fontSize: "0.8rem",
      color: "#D3D3E0",
      marginTop: "1rem",
    },
  };

  // Updated footerLinks with Contact Details column
  const footerLinks = {
    "CONTACT US": [
      "MR. MICHAEL A. GATELA",
      "Director | Ugnayan ng Pahinungod Mindanao",
      "pahinungod.upmin@up.edu.ph",
      "0919-0068-979",
    ],
    "FOR CURRENT STUDENTS": [
      "ACADEMIC PROGRAMS",
      "CSRS FOR STUDENTS",
      "STUDENT POLICIES",
      "SCHOLARSHIPS",
      "DOWNLOADABLE FORMS",
    ],
    "FOR TEACHING AND NONTEACHING STAFF": [
      "CSRS FOR FACULTY",
      "CITIZEN’S CHARTER",
      "UNIVERSITY POLICIES",
      "DOWNLOADABLE FORMS",
    ],
    "UGNAYAN NG PAHINUNGOD CAMPUSES": [
      { name: "DILIMAN", url: "https://pahinungod.upd.edu.ph" },
      { name: "LOS BAÑOS", url: "https://international.uplb.edu.ph/public-service/" },
      { name: "MANILA", url: "https://www.facebook.com/pahinungod.manila/" },
      { name: "VISAYAS", url: "https://www.facebook.com/PahinungodSaVisayas/" },
      { name: "OPEN UNIVERSITY", url: "https://pahinungod.upou.edu.ph/" },
      { name: "BAGUIO", url: "https://www.facebook.com/pahinungod.upbaguio/" },
      { name: "CEBU", url: "https://www.upcebu.edu.ph/ugnayan-ng-pahinungod/" },
    ],
  };

  return (
    <footer style={styles.container}>
      {/* Logo and Title */}
      <div style={styles.logoSection}>
        <img src={logo} alt="UP Mindanao Logo" style={styles.logo} />
        <div style={styles.titleSection}>
          <div style={styles.upTitle}>University of the Philippines</div>
          <div style={styles.upMindanao}>MINDANAO</div>
        </div>
      </div>

      {/* Link Columns */}
      <div style={styles.linksContainer}>
        {Object.entries(footerLinks).map(([section, links]) => (
          <div key={section} style={styles.column}>
            <div style={styles.heading}>{section}</div>
            {links.map((link, index) => {
              if (typeof link === "string" && section !== "CONTACT DETAILS") {
                return (
                  <a
                    key={index}
                    href="#"
                    style={styles.link}
                    onMouseEnter={(e) => (e.target.style.color = "#D3D3E0")}
                    onMouseLeave={(e) => (e.target.style.color = "white")}
                  >
                    {link}
                  </a>
                );
              } else if (typeof link === "object") {
                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.link}
                    onMouseEnter={(e) => (e.target.style.color = "#D3D3E0")}
                    onMouseLeave={(e) => (e.target.style.color = "white")}
                  >
                    {link.name}
                  </a>
                );
              } else if (section === "CONTACT DETAILS") {
                return (
                  <div key={index} style={{ fontSize: "0.85rem", lineHeight: "1.2rem" }}>
                    {link}
                  </div>
                );
              }
              return null;
            })}
          </div>
        ))}
      </div>

      {/* Copyright */}
      <div style={styles.copyright}>
        © 2025 University of the Philippines Mindanao
      </div>
    </footer>
  );
}

export default Footer;
