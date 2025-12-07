import React, { useState, useEffect } from "react";
import { Box, Container, Typography, Grid, CardMedia } from "@mui/material";
import { useNavigate } from "react-router-dom";  // ✅ import useNavigate
import Button from "../components/Button"; 
import heroLogo from "../assets/UNP Logo.png";
import heroBackground from "../assets/background.jpg";
import volunteerImage from "../assets/volunteer.png";
import "../styles/Home.css";
import { getRole } from "../services/auth";

export default function Home() {
<<<<<<<<< Temporary merge branch 1
  const navigate = useNavigate();
  const { user } = useAuth();

  // AUTO-BLOCK admin from viewing homepage
  useEffect(() => {
    const role = getRole();
    if (role === "admin") {
      navigate("/admin/dashboard", { replace: true });
    }
  }, []);

  // Volunteer button click
  const handleVolunteerClick = () => {
    if (user) {
      navigate("/events"); // Go to events if logged in
    } else {
      navigate("/register"); // Go to registration if not logged in
    }
  };

  const handleKnowMoreClick = () => {
    // Navigate to about page or scroll to info section
    navigate("/about");
};
>>>>>>>>> Temporary merge branch 2
  };

  return (
    <>
      {/* ---------- HERO SECTION ---------- */}
      <Box
        className="hero-section"
        sx={{
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Box className="overlay" />
        <Box className="glass-box">
          <img src={heroLogo} alt="Ugnayan ng Pahinungod Logo" className="hero-logo" />
          <Box className="hero-text-container">
            <Typography variant="h4" className="hero-title">
              UGNAYAN NG PAHINUNGOD
            </Typography>
            <Typography variant="body2" className="hero-subtext">
              The Ugnayan ng Pahinungód/Oblation Corps (UP/OC), also
              known as Pahinungód, was established in 1994.
            </Typography>
            <Button 
              text="KNOW MORE" 
              variant="primary" 
              className="hero-button"
            />
          </Box>
        </Box>
      </Box>

      {/* ---------- VOLUNTEER SECTION ---------- */}
      <Box className="volunteer-section">
        <Container maxWidth="lg">
          <Grid
            container
            spacing={4}
            alignItems="center"
            justifyContent="space-between"
            columns={12}
          >
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="h4"
                fontWeight="600"
                className="volunteer-heading"
              >
                Help shape tomorrow — <br /> volunteer today.
              </Typography>
              <Typography variant="body1" className="volunteer-description">
                {user 
                  ? "Browse available volunteer opportunities and make an impact."
                  : "Join our community of volunteers and start making a difference."}
              </Typography>
              <Button 
                text="Volunteer" 
                variant="primary"
                className="volunteer-button"
                onClick={handleVolunteerClick}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Box className="volunteer-glass">
                <CardMedia
                  component="img"
                  image={volunteerImage}
                  alt="Volunteer"
                  className="volunteer-img"
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
}