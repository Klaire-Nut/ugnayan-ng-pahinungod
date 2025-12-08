import { Navigate } from "react-router-dom";

export default function ProtectedVolunteerRoute({ children }) {
  const token = localStorage.getItem("volunteerToken");

  if (!token) {
    return <Navigate to="/volunteer/login" replace />;
  }

  return children;
}
