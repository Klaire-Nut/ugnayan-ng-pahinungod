import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import AboutUs from "./pages/AboutUs.jsx";
import Events from "./pages/Events.jsx";
import Register from "./pages/Register.jsx";
import AuthTest from "./components/AuthTest";

export default function App() {
  return (
    <Router>
      {/* AuthTest can be rendered outside or inside Routes */}
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
