import React, { useEffect, useState } from "react";
import "../../styles/Dashboard.css";
import { getAdminDashboard } from "../../services/adminApi";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="admin-dashboard-wrapper fade-in">

      {/* EVENTS SECTION */}
      <section className="events-section">
        <h2 className="section-title">Upcoming Events</h2>

        {dashboardData.recent_events.length === 0 ? (
          <p className="empty-text">No events yet.</p>
        ) : (
          <div className="events-cards-container">
            {dashboardData.recent_events.map((event) => (
              <div key={event.id} className="event-card">
                <h3 className="event-title">{event.title}</h3>
                <p><strong>Start:</strong> {new Date(event.start_date).toLocaleString()}</p>
                <p><strong>End:</strong> {new Date(event.end_date).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* RECENT VOLUNTEERS */}
      <section className="recent-volunteers slide-up">
        <h2 className="section-title">Recent Volunteers</h2>

        <div className="volunteer-table-wrapper">
          <table className="volunteers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Affiliation</th>
                <th>Date Joined</th>
                <th>ID</th>
              </tr>
            </thead>

            <tbody>
              {dashboardData.recent_volunteers.map((vol, idx) => (
                <tr key={idx}>
                  <td>{vol.name}</td>
                  <td>{vol.affiliation}</td>
                  <td>{vol.date_joined}</td>
                  <td>{vol.identifier || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};

export default AdminDashboard;
