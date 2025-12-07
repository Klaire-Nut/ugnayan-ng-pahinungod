// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { volunteerAPI } from "../services/volunteerApi";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---------------------------
  // LOAD USER FROM LOCAL STORAGE
  // ---------------------------
  useEffect(() => {
    const storedUser = localStorage.getItem("volunteer");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Stored user is corrupted:", e);
        localStorage.removeItem("volunteer");
      }
    }

    setLoading(false);
  }, []);

  // ---------------------------
  // LOGIN (USES volunteerAPI)
  // ---------------------------
  const login = async (email, password) => {
    const result = await volunteerAPI.login(email, password);

    if (!result.success) {
      return result;
    }

    const { volunteer } = result.data;

    // Save user data (token is stored via cookies automatically)
    localStorage.setItem("volunteer", JSON.stringify(volunteer));
    setUser(volunteer);

    return { success: true };
  };

  // ---------------------------
  // LOGOUT
  // ---------------------------
  const logout = async () => {
    await volunteerAPI.logout(); // session logout
    setUser(null);
    localStorage.removeItem("volunteer");
  };

  // ---------------------------
  // REGISTER
  // ---------------------------
  const register = async (data) => {
    return await volunteerAPI.register(data);
  };

  // ---------------------------
  // REFRESH USER VIA PROFILE API
  // ---------------------------
  const updateUser = async () => {
    const response = await volunteerAPI.getProfile();

    if (!response.success) return response;

    setUser(response.data);
    localStorage.setItem("volunteer", JSON.stringify(response.data));

    return { success: true };
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
