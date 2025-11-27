import React from "react";
import "../../styles/Dashboard.css";

const AdminDashboard = () => {
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
};

export default AdminDashboard;
