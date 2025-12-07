import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "../../components/EventCard";
import AdminTable from "../../components/AdminTable";
import { getAdminDashboard } from "../../services/adminApi";

// Normalize volunteer affiliation to a consistent format
const normalizeAffiliation = (affiliation) => {
  if (!affiliation) return "—"; // If empty or null
  const lower = affiliation.toLowerCase();

  // Rules for common types
  if (["student", "stud", "undergrad"].includes(lower)) return "Student";
  if (["faculty", "teacher", "professor"].includes(lower)) return "Faculty";
  if (["alumni", "grad"].includes(lower)) return "Alumni";
  if (["up staff", "staff", "employee"].includes(lower)) return "UP Staff";

  // Default: capitalize first letter of each word
  return affiliation
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};


export default function AdminDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Format a date string "2025-12-05" → "Dec 05, 2025"
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    }).format(date);
  };

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
                event={{
                  id: ev.id,
                  event_name: ev.event_name,
                  location: ev.location || "No location provided",
                  schedules: ev.schedules.map((s) => ({
                    date: s.date, // keep original date for calculations
                    start_time: s.start_time,
                    end_time: s.end_time,
                  })),
                  volunteers_needed: ev.volunteers_needed || 0,
                  volunteered: ev.volunteered || 0,
                  status: ev.status,
                  is_canceled: ev.is_canceled,
                }}
                onOpen={() => navigate(`/admin/events/${ev.id}`)}
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
            affiliation: normalizeAffiliation(vol.affiliation),
            date_joined: new Date(vol.date_joined).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            }),
            identifier: vol.identifier || "—",
          }))}
            actions={(row) => (
              <button
                onClick={() => navigate("/admin/volunteers")}
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
