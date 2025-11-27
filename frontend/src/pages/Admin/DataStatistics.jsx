import React from "react";
import { Box, Typography, Paper, Grid } from "@mui/material";

export default function DataStatistics() {
  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Data & Statistics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ padding: 3, textAlign: "center" }}>
            <Typography variant="h5">120</Typography>
            <Typography variant="body1">Total Volunteers</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ padding: 3, textAlign: "center" }}>
            <Typography variant="h5">18</Typography>
            <Typography variant="body1">Active Events</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ padding: 3, textAlign: "center" }}>
            <Typography variant="h5">450+</Typography>
            <Typography variant="body1">Total Participants</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
