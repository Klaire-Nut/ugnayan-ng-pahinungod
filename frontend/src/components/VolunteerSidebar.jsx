import React from "react";
import { NavLink } from "react-router-dom";
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
import "../styles/VolunteerSidebar.css";

const VolunteerSidebar = () => {
  return (
    <nav className="vol-sidebar">
      {/* LOGO */}
      <div className="sidebar-logo">
        <img src={logo} alt="UP Mindanao Logo" />
      </div>

      {/* NAVIGATION LINKS */}
      <NavLink to="/volunteer/dashboard" className="vol-link">
        <FaChartBar /> Dashboard
      </NavLink>

      <NavLink to="/volunteer/events" className="vol-link">
        <FaCalendarAlt /> Events
      </NavLink>

      <NavLink to="/volunteer/profile" className="vol-link">
        <FaUser /> Profile
      </NavLink>

      <NavLink to="/volunteer/history" className="vol-link">
        <FaHistory /> Volunteering History
      </NavLink>

      <NavLink to="/volunteer/privacy" className="vol-link">
        <FaCog /> Privacy Settings
      </NavLink>

      {/* BOTTOM SECTION */}
      <div className="vol-sidebar-bottom">
        <div className="vol-link">
          <FaQuestionCircle /> Help
        </div>
        <div className="vol-link logout">
          <FaSignOutAlt /> Log out
        </div>
      </div>
    </nav>
  );
};

export default VolunteerSidebar;
