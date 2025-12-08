import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await getCurrentUser();
        if (res.data.user) {
          setIsAdmin(true);
        }
      } catch (err) {
        console.log("User not logged in");
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  if (loading) return <div>Loading...</div>; // optional loader

   if (!isAdmin) return <Navigate to="/" replace />; // redirect if not logged in

  return children;
}
