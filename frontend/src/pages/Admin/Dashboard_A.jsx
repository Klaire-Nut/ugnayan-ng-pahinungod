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

      {/* CURRENT EVENTS */}
      <section className="events-section fade-in">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>CURRENT EVENTS</h2>

          <button
            onClick={() => navigate("/admin/events")}
            className="link-button"
          >
            View all events →
          </button>
        </div>

        <div className="events-grid">
          {recentEvents.length === 0 ? (
            <p>No events yet.</p>
          ) : (
            recentEvents.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                onOpen={() => navigate(`/admin/events/${ev.id}`)}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))
          )}
        </div>
      </section>

      {/* RECENT VOLUNTEERS */}
      <section className="volunteers-section fade-in" style={{ marginTop: "40px" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>RECENT VOLUNTEERS</h2>

          <button
            onClick={() => navigate("/admin/volunteers")}
            className="link-button"
          >
            View all volunteers →
          </button>
        </div>

        {/* Table */}
        <div style={{ marginTop: "10px" }}>
          <AdminTable
            columns={volunteerColumns}
            rows={processedRows}
            actions={(row) => (
              <button
                onClick={() => console.log("Viewing", row.id)}
                className="small-view-btn"
              >
                View
              </button>
            )}
          />
        </div>

      </section>

    </div>
  );
}
