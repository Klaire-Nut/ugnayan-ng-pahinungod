import React from "react";
import VolunteerSidebar from "../../components/VolunteerSidebar";
import "../../styles/Dashboard.css";

const VolunteerDashboard = () => {
  return (
    <div className="dashboard-page">
      <main className="dashboard-content">
        <section className="events-section fade-in">
          <h2>CURRENT EVENTS</h2>
          <div className="events-grid">
            <div className="event-card ongoing">
              <div className="event-header">
                <h3>EVENT TITLE</h3>
                <span>Detail ▾</span>
              </div>
              <p>📍 Tugbok, Davao City</p>
              <p>🕐 1:00 PM - 4:00 PM</p>
              <p>👥 24/25</p>
              <span className="status ongoing">ONGOING</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default VolunteerDashboard;
