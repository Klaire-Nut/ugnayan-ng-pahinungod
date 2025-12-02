// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";                  // ✅ correct
import { volunteerAPI } from "../services/volunteerApi";    // ✅ correct

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth on mount
    const token = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("volunteer");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("volunteer");
      }
    }
    setLoading(false);
  }, []);

  // ---------------------------
  // LOGIN
  // ---------------------------
  const login = async (email, password) => {
    try {
      // New API returns { success, data }
      const result = await authAPI.login({ email, password, role: "Volunteer" });

      if (!result.success) {
        return { success: false, error: result.error };
      }

      const { token, volunteer } = result.data;

      // Store token and user
      localStorage.setItem("authToken", token);
      localStorage.setItem("volunteer", JSON.stringify(volunteer));
      setUser(volunteer);

      return { success: true, data: volunteer };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.detail ||
          "Login failed",
      };
    }
  };

  // ---------------------------
  // LOGOUT
  // ---------------------------
  const logout = () => {
    authAPI.logout("Volunteer"); // new API accepts role
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("volunteer");
  };

  // ---------------------------
  // REGISTER
  // ---------------------------
  const register = async (volunteerData) => {
    try {
      return await authAPI.register(volunteerData);
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Registration failed",
      };
    }
  };

  // ---------------------------
  // UPDATE USER (GET PROFILE)
  // ---------------------------
  const updateUser = async () => {
    try {
      const response = await volunteerAPI.getProfile();

      if (!response.success) return response;

      setUser(response.data);
      localStorage.setItem("volunteer", JSON.stringify(response.data));

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Failed to update user:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to update user",
      };
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    loading,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
