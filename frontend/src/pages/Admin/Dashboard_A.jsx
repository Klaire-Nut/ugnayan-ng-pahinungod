import React, { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import EventCard from "../../components/EventCard";
import AdminTable from "../../components/AdminTable";
import { getAdminDashboard } from "../../api/AdminAPI";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch data from backend
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getAdminDashboard();
        console.log("Dashboard API response:", res.data);
        setDashboardData(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!dashboardData) return <div>No data available.</div>;

  // Process events
  const recentEvents = [...dashboardData.recent_events]
    .sort((a, b) => b.id - a.id)
    .slice(0, 3);

  return (
    <div className="admin-dashboard-wrapper">

      {/* EVENTS SECTION */}
      <section className="events-section fade-in">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
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
      <section
        className="volunteers-section fade-in"
        style={{ marginTop: "40px" }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
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
            columns={[
              { field: "name", headerName: "Name", width: 200 },
              { field: "affiliation", headerName: "Affiliation", width: 150 },
              { field: "date_joined", headerName: "Date Joined", width: 150 },
              { field: "identifier", headerName: "ID", width: 120 },
            ]}
            rows={dashboardData.recent_volunteers.map((vol, index) => ({
              id: index,
              name: vol.name,
              affiliation: vol.affiliation,
              date_joined: vol.date_joined,
              identifier: vol.identifier || "—",
            }))}
            actions={(row) => (
              <button
                onClick={() => navigate(`/admin/volunteers/${row.identifier}`)}
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
