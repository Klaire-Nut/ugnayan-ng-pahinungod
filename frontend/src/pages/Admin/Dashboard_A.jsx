import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import EventCard from "../../components/EventCard";
import AdminTable from "../../components/AdminTable";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { events, volunteers = [] } = useOutletContext();

  // Recent events
  const recentEvents = [...events]
    .sort((a, b) => b.id - a.id)
    .slice(0, 3);

  // Recent volunteers (last 5)
  const recentVolunteers = [...volunteers]
    .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))
    .slice(0, 5);

  // Define table columns
  const volunteerColumns = [
    { header: "Volunteer ID", field: "volunteerID" },
    { header: "Name", field: "name" },
    { header: "Affiliation", field: "affiliation" },
  ];

  // Format table rows
  const processedRows = recentVolunteers.map((v) => ({
    ...v,
    name: `${v.firstName} ${v.lastName}`,
  }));

  return (
    <div className="admin-dashboard-wrapper">
      <section className="events-section fade-in">
        <h2>CURRENT EVENTS</h2>

        <div className="events-grid">
          {/* event cards here */}
        </div>
      </section>

      <section className="volunteers-section slide-right">
        <h2>VOLUNTEERS</h2>

        <div className="volunteers-table">
          {/* table here */}
        </div>
      </section>
    </div>
  );
}
