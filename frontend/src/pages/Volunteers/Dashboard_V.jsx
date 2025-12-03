import React, { useState, useEffect } from "react";
import Sidebar from "../../components/VolunteerSidebar";
import "../../styles/Dashboard.css";
import { getCurrentUser } from "../../services/auth";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if (res.role === "Volunteer") {
          setUser(res.data);   // allow volunteer
        } else if (res.role === "Admin") {
          navigate("/admin");  // redirect admins away
        }
      })
      .catch(() => {
        navigate("/login");    // not logged in
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  if (loading) return <div>Loading...</div>;

  if (!user) return null; // nothing to show during redirects

  return (
    <div className="dashboard-page">
      <Sidebar />

      <main className="dashboard-content">
        <div className="welcome-section">
          <h1>
            Welcome back,{" "}
            {user.first_name || user.email || "Volunteer"}!
          </h1>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h2>Your Profile Details</h2>
            <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Affiliation:</strong> {user.affiliation_type}</p>
          </div>

          <div className="dashboard-card">
            <h2>Your Next Events</h2>
            <p>Coming soon…</p>
          </div>

          <div className="dashboard-card">
            <h2>Statistics</h2>
            <p>History, completed events, etc — integrate later.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
