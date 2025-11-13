import React from "react";
import { Box, Container, Typography, TextField, Button, Grid, Paper } from "@mui/material";
import DefaultPage from "../layout/default_page.jsx";
import "../styles/Register.css";

export default function Register() {
  return (
    <DefaultPage>
      <Box className="register-section">
        <Container maxWidth="sm">
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 3,
              backgroundColor: "#f9f9f9",
            }}
          >
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              sx={{ fontWeight: 600, color: "#11073D" }}
            >
              Volunteer Registration
            </Typography>

            <Typography variant="body1" align="center" sx={{ mb: 3 }}>
              Fill out the form below to become a volunteer with Ugnayan ng Pahinungod.
            </Typography>

            <form>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="First Name" variant="outlined" required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Last Name" variant="outlined" required />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Email Address" type="email" variant="outlined" required />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Phone Number" type="tel" variant="outlined" />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Why do you want to volunteer?"
                    multiline
                    rows={4}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{
                      mt: 2,
                      backgroundColor: "#FF7F00",
                      "&:hover": { backgroundColor: "#e66e00" },
                    }}
                  >
                    Submit
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Container>
      </Box>
    </DefaultPage>
  );
}
