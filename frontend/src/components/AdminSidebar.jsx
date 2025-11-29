import React from "react";
import { FaChartBar, FaUsers, FaCog, FaLock, FaSignOutAlt, FaQuestionCircle } from "react-icons/fa";
import { MdEvent } from "react-icons/md";
import { NavLink, useNavigate } from "react-router-dom"; 
import logo from "../assets/UNP Logo.png";
import "../styles/Sidebar.css";
import { logout } from "../services/auth";

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();                 // backend clears session
      navigate("/", { replace: true }); // redirect to main page
      window.location.reload();        // ensure cached pages cleared
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <aside className="sidebar">
      {/* ======= Logo Section ======= */}
      <div className="sidebar-logo">
         <img src={logo} alt="UP Mindanao Logo" />
    </div>

      {/* ======= Navigation Links ======= */}
      <nav className="sidebar-nav">
        <NavLink to="dashboard" className="sidebar-link">
          <FaChartBar /> Dashboard
        </NavLink>
        <NavLink to="events" className="sidebar-link">
          <MdEvent /> Events
        </NavLink>
        <NavLink to="volunteers" className="sidebar-link">
          <FaUsers /> Manage Volunteers
        </NavLink>
        <NavLink to="stats" className="sidebar-link">
          <FaCog /> Data Statistics
        </NavLink>
        <NavLink to="privacy" className="sidebar-link">
          <FaLock /> Privacy Settings
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

        {/* Dark Mode Toggle */}
        <div className="dark-mode-toggle">
          <input type="checkbox" id="darkmode-switch" />
          <label htmlFor="darkmode-switch"></label>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;