import React, { useState, useEffect } from "react";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import Footer from "../components/Footer";
import { Outlet, useLocation } from "react-router-dom";
import "../styles/admin-shared.css";
import { apiClient } from "../services/apiClient";
import { adminGetVolunteers } from "../services/adminApi";

export default function DefaultPageAdmin() {
  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const location = useLocation();

  // -----------------------------
  // Fetch Events Function
  // -----------------------------
  const fetchEvents = async () => {
    try {
      const data = await apiClient("http://localhost:8000/api/admin/events/");
      setEvents(data);
    } catch (err) {
      console.error("ERROR LOADING EVENTS:", err);
    }
  };

  // -----------------------------
  // Fetch Volunteers Function
  // -----------------------------
  const fetchVolunteers = async () => {
    try {
      const data = await adminGetVolunteers();

      // data should be an array of volunteers as returned by AdminVolunteerListSerializer
      // normalize to the shape used by AdminVolunteers and Dashboard_A
      const normalized = (data || []).map((v) => {
        const fullName = v.full_name || "";
        // split full name into first and last (best-effort)
        const nameParts = fullName.trim().split(/\s+/);
        const firstName = nameParts.length === 0 ? "" : nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

        return {
          // use volunteer_id as frontend id (routes expect this)
          id: v.volunteer_id ?? v.id ?? null,

          // names expected by your UI
          firstName: firstName,
          lastName: lastName,
          fullName: fullName,

          // registeredAt expected by UI — use date_joined
          registeredAt: v.date_joined || v.registeredAt || null,

          // map affiliation_type -> affiliation (UI expects something like "STUDENT")
          affiliation: v.affiliation_type ? String(v.affiliation_type).toUpperCase() : "",

          // Additional helpful fields
          email: v.email || null,
          status: v.status || null,
          totalHours: v.total_hours ?? 0,
          // keep raw backend shape in case other components need it
          raw: v,
        };
      });

      setVolunteers(normalized);
    } catch (err) {
      console.error("ERROR LOADING VOLUNTEERS:", err);
    }
  };

  // -----------------------------
  // Reload events whenever URL changes
  // -----------------------------
  useEffect(() => {
    fetchEvents();
    fetchVolunteers();
  }, [location.pathname]);

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
            <Outlet context={{ events, setEvents, volunteers, setVolunteers }} />
          </div>
        </section>
      </div>

      <footer className="admin-footer">
        <Footer />
      </footer>
    </div>
  );
}
