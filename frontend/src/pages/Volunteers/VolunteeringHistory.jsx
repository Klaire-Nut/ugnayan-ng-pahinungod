// src/pages/VolunteerHistory.jsx
import React from "react";
import VolunteerSidebar from "../../components/VolunteerSidebar";
import "../../styles/VolunteerHistory.css";
import VolunteeringHistoryTable from "../../components/VolunteeringHistoryTable";

// Fake data
const sampleHistory = [
  { event: "Tree Planting", date: "2025-11-10", timeIn: "08:00 AM", timeOut: "12:00 PM", timeAllotted: "4h" },
  { event: "Beach Cleanup", date: "2025-11-15", timeIn: "09:00 AM", timeOut: "01:00 PM", timeAllotted: "4h" },
  { event: "Blood Donation Drive", date: "2025-11-20", timeIn: "10:00 AM", timeOut: "01:00 PM", timeAllotted: "3h" },
  { event: "Food Distribution", date: "2025-11-22", timeIn: "07:30 AM", timeOut: "11:30 AM", timeAllotted: "4h" },
  { event: "Tree Planting", date: "2025-11-24", timeIn: "08:00 AM", timeOut: "12:00 PM", timeAllotted: "4h" },
];

const VolunteerHistory = () => {
  return (
    <div className="vol-history-page">
      <VolunteerSidebar />

      <div className="vol-history-main">
        <VolunteeringHistoryTable data={sampleHistory} />
      </div>
    </div>
  );
};

export default VolunteerHistory;
