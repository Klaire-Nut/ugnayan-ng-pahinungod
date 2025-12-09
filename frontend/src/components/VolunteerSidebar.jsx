import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaChartBar,
  FaCalendarAlt,
  FaUser,
  FaHistory,
  FaCog,
  FaQuestionCircle,
  FaSignOutAlt
} from "react-icons/fa";

import logo from "../assets/UNP Logo.png";
import "../styles/Sidebar.css"; // ← same CSS as admin

const VolunteerSidebar = () => {
  const navigate = useNavigate();

 const handleLogout = () => {
    // Remove volunteer token
    localStorage.removeItem("volunteerToken");
    localStorage.removeItem("volunteerData");
    sessionStorage.clear();

    // Clear cookies
    document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie
            .replace(/^ +/, "")
            .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });

    // Redirect to HOME PAGE
    navigate("/", { replace: true });

    // Prevent back navigation to protected pages
    setTimeout(() => {
        window.history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", () => {
            navigate("/", { replace: true });
        });
    }, 50);

    // OPTIONAL: reload UI once
    setTimeout(() => window.location.reload(), 80);
};




  return (
    <aside className="sidebar">
      {/* ======= Logo Section ======= */}
      <div className="sidebar-logo">
        <img src={logo} alt="UNP Logo" />
      </div>

      {/* ======= Navigation Links ======= */}
      <nav className="sidebar-nav">
        <NavLink to="/volunteer/dashboard" className="sidebar-link">
          <FaChartBar /> Dashboard
        </NavLink>

        <NavLink to="/volunteer/events" className="sidebar-link">
          <FaCalendarAlt /> Events
        </NavLink>

        <NavLink to="/volunteer/profile" className="sidebar-link">
          <FaUser /> Profile
        </NavLink>

        <NavLink to="/volunteer/history" className="sidebar-link">
          <FaHistory /> Volunteering History
        </NavLink>

        <NavLink to="/volunteer/privacy" className="sidebar-link">
          <FaCog /> Privacy Settings
        </NavLink>
      </nav>

      {/* ======= Bottom Section ======= */}
      <div className="sidebar-bottom">
        <div className="sidebar-link help">
          <FaQuestionCircle /> Help
        </div>

        <div className="sidebar-link logout" onClick={handleLogout}>
          <FaSignOutAlt /> Log out
        </div>

        {/* DARK MODE TO MATCH ADMIN */}
        <div className="dark-mode-toggle">
          <input type="checkbox" id="darkmode-switch" />
          <label htmlFor="darkmode-switch"></label>
        </div>
      </div>
    </aside>
  );
};

export default VolunteerSidebar;