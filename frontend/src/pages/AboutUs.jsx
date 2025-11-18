// src/pages/AboutUs.jsx
import React from "react";
import { Box, Container, Typography, Grid, CardMedia } from "@mui/material";
import DefaultPage from "../layout/default_page.jsx";
import aboutImage from "../assets/about1.png"; // optional image
import "../styles/AboutUs.css";

export default function AboutUs() {
  return (
    <DefaultPage>
      <Box className="about-section">
        <Container maxWidth="md">
          <Typography
            variant="h3"
            fontWeight="700"
            textAlign="center"
            gutterBottom
          >
            About Us
          </Typography>
          <Typography
            variant="body1"
            textAlign="center"
            color="text.secondary"
            mb={5}
          >
            The Ugnayan ng Pahinungód is the volunteer service program of the
            University of the Philippines. It promotes volunteerism and
            community engagement as an expression of the University’s commitment
            to serve the Filipino people.
          </Typography>

          <Grid
            container
            spacing={4}
            alignItems="center"
            justifyContent="center"
          >
            <Grid item xs={12} md={6}>
              <Typography variant="h5" fontWeight="600" gutterBottom>
                Our Mission
              </Typography>
              <Typography variant="body2" color="text.secondary">
                To inspire and empower the UP community to actively participate
                in nation-building through meaningful volunteer work that
                uplifts lives and strengthens communities.
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <CardMedia
                component="img"
                image={aboutImage}
                alt="About Ugnayan ng Pahinungod"
                sx={{
                  borderRadius: 3,
                  boxShadow: 3,
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </DefaultPage>
  );
}
