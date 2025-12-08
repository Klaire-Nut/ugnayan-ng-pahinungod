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
      maxWidth: "900px",
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

  const footerLinks = {
    "ABOUT US": ["COLLEGES AND SCHOOLS", "VISIT OUR CAMPUS", "CONTACT US"],
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
      { name: "LOS BAÑOS", url: "https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&ved=2ahUKEwiW1NqK5JuRAxXBkq8BHRdyDj4QFnoECDcQAQ&url=https%3A%2F%2Finternational.uplb.edu.ph%2Fpublic-service%2F&usg=AOvVaw3WHa3spZ_HN0Nb2UTmwFTW&opi=89978449" },
      { name: "MANILA", url: "https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwjwxdfQ5JuRAxUej68BHeSNABQQFnoECDsQAQ&url=https%3A%2F%2Fwww.facebook.com%2Fpahinungod.manila%2F&usg=AOvVaw3iklf61OS0Sje3cqAA9Lum&opi=89978449" },
      { name: "VISAYAS", url: "https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwi_wI3d5JuRAxXoi68BHRpnMY0QFnoECCMQAQ&url=https%3A%2F%2Fwww.facebook.com%2FPahinungodSaVisayas%2F&usg=AOvVaw0nkjYh8pgcR8dUDNUQsdG2&opi=89978449" },
      { name: "OPEN UNIVERSITY", url: "https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwjImMPx5JuRAxWFaPUHHSM8DG0QFnoECBoQAQ&url=https%3A%2F%2Fpahinungod.upou.edu.ph%2F&usg=AOvVaw04fMffvfzrSYO1Ovaoa7S4&opi=89978449" },
      { name: "BAGUIO", url: "https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwiEpsz85JuRAxVBUfUHHfB2KwgQFnoECBAQAQ&url=https%3A%2F%2Fwww.facebook.com%2Fpahinungod.upbaguio%2F&usg=AOvVaw1OqQ1DoLKkYN8ddAgMEH_x&opi=89978449" },
      { name: "CEBU", url: "https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwiDuOWI5ZuRAxWQavUHHQW3E4kQFnoECCIQAQ&url=https%3A%2F%2Fwww.upcebu.edu.ph%2Fugnayan-ng-pahinungod%2F&usg=AOvVaw0ExLEWjUWHACdk-5GuWG10&opi=89978449" },
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
              if (typeof link === "string") {
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
              } else {
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
              }
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
