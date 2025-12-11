// src/pages/VolunteerHistory.jsx
import React, { useEffect, useState } from "react";
import VolunteerSidebar from "../../components/VolunteerSidebar";
import "../../styles/VolunteerHistory.css";
import VolunteeringHistoryTable from "../../components/VolunteeringHistoryTable";
import { volunteerAPI } from "../../services/volunteerApi";

const VolunteerHistory = () => {
  const [history, setHistory] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  
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
      // FIXED: Show 0h instead of blank
      // ===============================
      const formatted = response.data.history.map((item) => ({
        event: item.event_name,
        date: item.date?.split("T")[0] || "",
        hours_rendered: item.hours_rendered ?? 0,
        timeAllotted:
          item.hours_rendered !== null && item.hours_rendered !== undefined
            ? item.hours_rendered + "h"
            : "",
      }));
      
      // Compute total hours
      const sum = formatted.reduce((acc, cur) => acc + (cur.hours_rendered || 0), 0);
      setTotalHours(sum);

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
      <div className="vol-history-main fade-in">
        <div className="total-hours-box">
          <strong>Total Hours Rendered:</strong> {totalHours}h
        </div>
        <VolunteeringHistoryTable data={history} />
      </div>
    </div>
  );
};

export default VolunteerHistory;