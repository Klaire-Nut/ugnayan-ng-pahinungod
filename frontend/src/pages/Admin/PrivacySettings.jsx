import React from "react";
import { Box, Typography, Paper, FormControlLabel, Switch } from "@mui/material";

export default function PrivacySettings() {
  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Privacy Settings
      </Typography>

      <Paper sx={{ padding: 3 }}>
        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Allow volunteers to edit their profile"
        />

        <FormControlLabel
          control={<Switch />}
          label="Enable two-factor authentication"
        />

        <FormControlLabel
          control={<Switch defaultChecked />}
          label="Show volunteer statistics publicly"
        />
      </Paper>
    </Box>
  );
}
