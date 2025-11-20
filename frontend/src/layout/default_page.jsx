import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Box } from "@mui/material";

export default function DefaultPage({ children }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Header />
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
}