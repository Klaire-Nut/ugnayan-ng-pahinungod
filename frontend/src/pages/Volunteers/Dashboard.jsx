import React from "react";
import Sidebar from "../../components/Sidebar";
import "../../styles/Dashboard.css";

const VolunteerDashboard = () => {
  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
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

            <div className="event-card done">
              <div className="event-header">
                <h3>EVENT TITLE</h3>
                <span>Detail ▾</span>
              </div>
              <p>📍 Tugbok, Davao City</p>
              <p>🕐 1:00 PM - 4:00 PM</p>
              <p>👥 24/25</p>
              <span className="status done">DONE</span>
            </div>

            <div className="event-card cancel">
              <div className="event-header">
                <h3>EVENT TITLE</h3>
                <span>Detail ▾</span>
              </div>
              <p>📍 Tugbok, Davao City</p>
              <p>🕐 1:00 PM - 4:00 PM</p>
              <p>👥 24/25</p>
              <span className="status cancel">CANCEL</span>
            </div>
          </div>
        </section>

        {/* Volunteers Table */}
        <section className="volunteers-section slide-right">
          <h2>VOLUNTEERS</h2>
          <div className="volunteers-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Year</th>
                  <th>Program</th>
                  <th>College</th>
                  <th>Date Registered</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Juan dela Cruz</td>
                  <td>3</td>
                  <td>BSCS</td>
                  <td>CSM</td>
                  <td>10/13/2025</td>
                </tr>
                <tr>
                  <td>Jenni Feer</td>
                  <td>4</td>
                  <td>BSFT</td>
                  <td>CSM</td>
                  <td>10/13/2025</td>
                </tr>
                <tr>
                  <td>Jei Mio</td>
                  <td>4</td>
                  <td>BSA</td>
                  <td>CHSS</td>
                  <td>10/12/2025</td>
                </tr>
                <tr>
                  <td>Jim Ness</td>
                  <td>3</td>
                  <td>BACMA</td>
                  <td>CHSS</td>
                  <td>10/11/2025</td>
                </tr>
                <tr>
                  <td>Ken Neb</td>
                  <td>3</td>
                  <td>BSS</td>
                  <td>DHK</td>
                  <td>10/11/2025</td>
                </tr>
                <tr>
                  <td>Ria James</td>
                  <td>2</td>
                  <td>AMAT</td>
                  <td>CSM</td>
                  <td>10/10/2025</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default VolunteerDashboard;
