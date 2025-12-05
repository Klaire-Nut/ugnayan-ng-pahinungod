// src/pages/VolunteerHistory.jsx
import React, { useEffect, useState } from "react";
import VolunteerSidebar from "../../components/VolunteerSidebar";
import "../../styles/VolunteerHistory.css";
import VolunteeringHistoryTable from "../../components/VolunteeringHistoryTable";
import { volunteerAPI } from "../../services/volunteerApi";

const VolunteerHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Convert backend timestamp → "08:00 AM"
  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const dateObj = new Date(timestamp);
    let hours = dateObj.getHours();
    let minutes = dateObj.getMinutes().toString().padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
  };

  // Compute Time Out = signup_date + hours_rendered
  const calculateTimeOut = (signupDate, hours) => {
    const dateObj = new Date(signupDate);
    dateObj.setHours(dateObj.getHours() + hours);
    return formatTime(dateObj);
  };

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);

      const response = await volunteerAPI.getHistory();

      if (!response.success) {
        setError(response.error);
        setLoading(false);
        return;
      }

      // ===============================
      // ⭐ FIXED: Show 0h instead of blank
      // ===============================
      const formatted = response.data.history.map((item) => ({
        event: item.event_name,
        date: item.date?.split("T")[0] || "",
        timeIn: formatTime(item.time_in),
        timeOut: formatTime(item.time_out),

        // ❗ OLD (incorrect):
        // timeAllotted: item.hours_rendered ? item.hours_rendered + "h" : "",

        // ✅ NEW (correct):
        // This now displays 0h instead of hiding it.
        timeAllotted:
          item.hours_rendered !== null && item.hours_rendered !== undefined
            ? item.hours_rendered + "h"
            : "",
      }));

      setHistory(formatted);
      setLoading(false);
    };

    loadHistory();
  }, []);

  if (loading) return <div className="vol-history-page">Loading history...</div>;
  if (error) return <div className="vol-history-page error-message">{error}</div>;

  return (
    <div className="vol-history-page">
      <VolunteerSidebar />
      <div className="vol-history-main">
        <VolunteeringHistoryTable data={history} />
      </div>
    </div>
  );
};

export default VolunteerHistory;
