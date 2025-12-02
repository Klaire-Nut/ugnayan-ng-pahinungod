import React from "react";
import "../styles/VolunteeringHistoryTable.css";

const VolunteeringHistoryTable = ({ data = [] }) => {
  return (
    <div className="vh-wrapper">
      <div className="vh-title">Volunteering History</div>

      {/* Table container with scroll */}
      <div className="vh-table-container">
        <table className="vh-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Time Allotted</th>
            </tr>
          </thead>

          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr key={index}>
                  <td>{item.event}</td>
                  <td>{item.date}</td>
                  <td>{item.timeIn}</td>
                  <td>{item.timeOut}</td>
                  <td>{item.timeAllotted}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", padding: "1rem" }}>
                  No volunteering history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VolunteeringHistoryTable;
