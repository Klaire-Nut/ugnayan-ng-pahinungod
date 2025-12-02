import React, { useState, useEffect } from "react";
import Sidebar from "../../components/VolunteerSidebar";
import "../../styles/Dashboard.css";
import { getCurrentUser } from "../../services/auth"; // import your auth service

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser("Volunteer")  // or role dynamically
      .then((res) => {
        setUser(res.data.user);   // make sure backend returns { user: {...} }
      })
      .catch((err) => {
        console.error("Failed to fetch user:", err);
      });
  }, []);

  if (!user) return <div>Loading...</div>; // show loading until user is fetched

  return (
    <div className="dashboard-page">
      <Sidebar />
      <main className="dashboard-content">
        <div className="welcome-section">
          <h1>Welcome back, {user.first_name || user.username}!</h1>
        </div>

        {/* Your events and volunteers sections remain the same */}
      </main>
    </div>
  );
};

export default Dashboard;
