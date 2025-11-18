import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import Events from "./pages/Events.jsx";
import Register from "./pages/Register/Register.jsx";


export default function App() {
  return (
    <Router>
      {/* TEMP: AuthTest is for testing login/logout functionality.
          Remove this once the front end login components are fully integrated */}
      <AuthTest />  

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/events" element={<Events />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}