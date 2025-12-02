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
    navigate("/", { replace: true });
    window.location.reload();
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