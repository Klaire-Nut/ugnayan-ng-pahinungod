// src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Container,
  Typography,
  Grid,
  CardMedia,
} from "@mui/material";
import Button from "../components/Button";
import heroLogo from "../assets/UNP Logo.png";
import heroBackground from "../assets/background.jpg";
import volunteerImage from "../assets/volunteer.png";
import "../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

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
              Join us in making a difference in our community through volunteerism. 
              Together, we can create positive change and build a better tomorrow.
            </Typography>
            <Button 
              text="KNOW MORE" 
              variant="primary" 
              className="hero-button"
              onClick={handleKnowMoreClick}
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
                text={user ? "View Events" : "Get Started"}
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