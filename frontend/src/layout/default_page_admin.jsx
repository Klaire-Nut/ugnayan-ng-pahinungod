import React, { useState } from "react";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import "../styles/admin-shared.css";

export default function DefaultPageAdmin() {
  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState([
    { id: 1, firstName: "Juan", lastName: "Dela Cruz", affiliation: "STUDENT", registeredAt: "2025-01-10" },
    { id: 2, firstName: "Maria", lastName: "Santos", affiliation: "ALUMNI", registeredAt: "2025-01-10" },
    { id: 3, firstName: "Carlos", lastName: "Reyes", affiliation: "UP STAFF", registeredAt: "2025-01-11" },
  ]);

  // 🔔 Notification handler
  const [notif, setNotif] = useState({ open: false, type: "success", message: "" });
  const showNotif = (type, message) => setNotif({ open: true, type, message });

  return (
    <div className="admin-layout">
      <div className="admin-header">
        <AdminHeader />
      </div>

      <div className="admin-main">
        <aside className="admin-sidebar">
          <AdminSidebar />
        </aside>

        <section className="admin-content">
          <div className="admin-content-inner">
            <Outlet context={{ events, setEvents, volunteers, setVolunteers, notif, setNotif, showNotif }} />
          </div>
        </section>
      </div>

      <footer className="admin-footer">
        <Footer />
      </footer>
    </div>
  );
}
