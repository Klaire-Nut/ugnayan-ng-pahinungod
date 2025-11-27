import React from "react";
import Header1 from "../components/Header1";
import Footer from "../components/Footer";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

export default function DefaultPageVolunteer() {
  // Example auth logic; replace with your real auth state
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login"; // or use navigate
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      {/* Header1 instead of Header */}
      <Header1 isLoggedIn={isLoggedIn} onLogout={handleLogout} />

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet /> {/* render nested routes */}
      </Box>

      <Footer />
    </Box>
  );
}
