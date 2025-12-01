import React, { useState } from "react";
import { login, logout, getCurrentUser } from "../services/auth";

export default function AuthTest() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      const res = await login({ username, password });
      setMessage(res.data.message + " as " + res.data.username);
    } catch (err) {
      setMessage(err.response?.data?.error || "Login failed");
    }
  };

  const handleLogout = async () => {
    try {
      const res = await logout();
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.error || "Logout failed");
    }
  };

  const handleCheckUser = async () => {
    try {
      const res = await getCurrentUser();
      setMessage(res.data.user ? "Logged in as " + res.data.user : "No active session");
    } catch (err) {
      setMessage("Error checking session");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Auth Test</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div style={{ marginTop: 10 }}>
        <button onClick={handleLogin}>Login</button>
        <button onClick={handleLogout}>Logout</button>
        <button onClick={handleCheckUser}>Check Session</button>
      </div>
      <p>{message}</p>
    </div>
  );
}
