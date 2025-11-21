import React from "react";
import { FaChartBar, FaUsers, FaCog, FaLock, FaSignOutAlt, FaQuestionCircle } from "react-icons/fa";
import { MdEvent } from "react-icons/md";
import { NavLink } from "react-router-dom";
import logo from "../assets/UNP Logo.png";
import "../styles/Sidebar.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      {/* ======= Logo Section ======= */}
      <div className="sidebar-logo">
         <img src={logo} alt="UP Mindanao Logo" />
    </div>

      {/* ======= Navigation Links ======= */}
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="sidebar-link">
          <FaChartBar /> Dashboard
        </NavLink>
        <NavLink to="/events" className="sidebar-link">
          <MdEvent /> Events
        </NavLink>
        <NavLink to="/manage-volunteers" className="sidebar-link">
          <FaUsers /> Manage Volunteers
        </NavLink>
        <NavLink to="/data-statistics" className="sidebar-link">
          <FaCog /> Data Statistics
        </NavLink>
        <NavLink to="/privacy-settings" className="sidebar-link">
          <FaLock /> Privacy Settings
        </NavLink>
      </nav>

      {/* ======= Bottom Section ======= */}
      <div className="sidebar-bottom">
        <div className="sidebar-link help">
          <FaQuestionCircle /> Help
        </div>
        <div className="sidebar-link logout">
          <FaSignOutAlt /> Log out
        </div>

        {/* Dark Mode Toggle */}
        <div className="dark-mode-toggle">
          <input type="checkbox" id="darkmode-switch" />
          <label htmlFor="darkmode-switch"></label>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
