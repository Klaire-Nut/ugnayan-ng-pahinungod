import React from "react";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import "../styles/admin-shared.css"; // <- import the shared CSS

export default function DefaultPageAdmin() {
  return (
    <div className="admin-layout">
      <div className="admin-header">
        <AdminHeader />      {/* you can have AdminHeader render only inner content,
                                but keep the wrapper .admin-header here so styles apply */}
      </div>

      <div className="admin-main">
        <aside className="admin-sidebar">
          <AdminSidebar />
        </aside>

        <section className="admin-content">
          <div className="admin-content-inner">
            <Outlet />
          </div>
        </section>
      </div>

      <footer className="admin-footer">
        <Footer />
      </footer>
    </div>
  );
}
