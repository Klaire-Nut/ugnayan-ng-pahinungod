import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DefaultPage from "./layout/default_page";
import DefaultPageVolunteer from "./layout/default_page_volunteers";

import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import Events from "./pages/Events";

import Register from "./pages/Register/Register.jsx";
import Login from "./pages/Login";

import Dashboard from "./pages/Volunteers/Dashboard";

function App() {
  return (
    <Router>
      <Routes>

        {/* ALL PUBLIC PAGES UNDER DEFAULT LAYOUT */}
        <Route element={<DefaultPage />}>
          <Route index element={<Home />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="events" element={<Events />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
        </Route>

        {/* VOLUNTEER DASHBOARD LAYOUT */}
        <Route element={<DefaultPageVolunteer />}>
          <Route path="dashboard" element={<Dashboard />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;