import React from "react";
import VolunteerHeader from "../components/VolunteerHeader";
import VolunteerSidebar from "../components/VolunteerSidebar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import "../styles/admin-shared.css"; // reuse same layout CSS

export default function DefaultPageVolunteer() {
  // Example auth logic
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="admin-layout">
      {/* Header */}
      <div className="admin-header">
        <VolunteerHeader isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      </div>

      {/* Main content */}
      <div className="admin-main">
        <aside className="vol-sidebar">
          <VolunteerSidebar />
        </aside>

        <section className="admin-content">
          <div className="admin-content-inner">
            <Outlet /> {/* Nested route (dashboard, profile, events) will render here */}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="admin-footer">
        <Footer />
      </footer>
    </div>
  );
}
