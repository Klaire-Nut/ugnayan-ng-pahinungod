import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DefaultPage from "./layout/default_page";
import DefaultPageVolunteer from "./layout/default_page_volunteers"; // ✅ import new layout
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import Events from "./pages/Events";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Volunteers/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Pages that use DefaultPage (Header + Footer with regular Header) */}
        <Route element={<DefaultPage />}>
          <Route index element={<Home />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="events" element={<Events />} />
        </Route>

        {/* Volunteer dashboard uses DefaultPageVolunteer (Header1 + Footer) */}
        <Route element={<DefaultPageVolunteer />}>
          <Route path="dashboard" element={<Dashboard />} />
        </Route>

        {/* Pages without layout */}
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
