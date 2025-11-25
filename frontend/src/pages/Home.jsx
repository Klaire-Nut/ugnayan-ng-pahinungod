import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  CardMedia,
  Card
} from "@mui/material";
import DefaultPage from "../layout/default_page.jsx";
import heroLogo from "../assets/UNP Logo.png";
import heroBackground from "../assets/background.jpg";
import volunteerImage from "../assets/volunteer.png";
import "../styles/Home.css";


export default function Home() {
  return (
    <DefaultPage>
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
        {/* Optional Overlay */}
        <Box className="overlay" />
        <Box className="glass-box">
          <img src={heroLogo} alt="Ugnayan ng Pahinungod Logo" className="hero-logo" />
          <Box className="hero-text-container">
            <Typography variant="h4" className="hero-title">
              UGNAYAN NG PAHINUNGOD
            </Typography>
            <Typography variant="body2" className="hero-subtext">
              Chancellor Lyre Anni E. Murao said the flag at the campus will be flown at half-mast starting August 1 for 10 days.
            </Typography>
            <Button variant="contained" className="hero-button">
              KNOW MORE
            </Button>
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
            {/* Text + Button */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="h4"
                fontWeight="600"
                className="volunteer-heading"
              >
                Help shape tomorrow — <br /> volunteer today.
              </Typography>
              <Button variant="contained" className="volunteer-button">
                Volunteer
              </Button>
            </Grid>

            {/* Volunteer Image */}
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
    </DefaultPage>
  );
}
