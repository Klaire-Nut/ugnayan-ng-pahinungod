import React from "react";
import DefaultPage from "../layout/default_page.jsx";
import { Typography, Box } from "@mui/material";

export default function Events() {
  return (
    <DefaultPage>
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" fontWeight="600">
          Events Page
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          This is where event details or upcoming activities will appear.
        </Typography>
      </Box>
    </DefaultPage>
  );
}
