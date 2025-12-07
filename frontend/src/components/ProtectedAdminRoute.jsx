import React from "react";
import { Navigate } from "react-router-dom";
import { getRole } from "../services/auth";

// Simple admin-only route using saved role
export default function ProtectedAdminRoute({ children }) {
  const role = getRole();

  if (role !== "admin") return <Navigate to="/" replace />;
  return children;
}
