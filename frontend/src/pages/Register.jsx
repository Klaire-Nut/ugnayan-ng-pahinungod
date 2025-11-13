import React from "react";
import { Box, Container, Typography, TextField, Button, Grid, Paper } from "@mui/material";
import DefaultPage from "../layout/default_page.jsx";
import "../styles/Register.css";

export default function Register() {
  // -------------------------------
  // Added handleSubmit function
  // This sends form data to the backend using fetch
  // -------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent default form submission

    // Gather form data by name attributes
    const data = {
      first_name: e.target.firstName.value,
      last_name: e.target.lastName.value,
      email: e.target.email.value,
      mobile_number: e.target.phone.value,
      hobbies_interests: e.target.reason.value,
    };

    try {
      // Send POST request to Django backend API endpoint
      const response = await fetch("http://localhost:8000/api/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Registration successful!");
        e.target.reset(); // reset form after successful submission
      } else {
        alert("Error registering volunteer.");
      }
    } catch (error) {
      console.error(error);
      alert("Network error.");
    }
  };

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

            {/* -------------------------------
                Added onSubmit handler
                ------------------------------- */}
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="First Name" name="firstName" variant="outlined" required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Last Name" name="lastName" variant="outlined" required />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Email Address" type="email" name="email" variant="outlined" required />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Phone Number" type="tel" name="phone" variant="outlined" />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Why do you want to volunteer?"
                    multiline
                    rows={4}
                    name="reason"
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
