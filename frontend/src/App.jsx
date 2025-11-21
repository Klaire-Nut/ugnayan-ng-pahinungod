import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DefaultPage from "./layout/default_page";
import DefaultPageVolunteer from "./layout/default_page_volunteers";

// Pages
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import Events from "./pages/Events";
import Register from "./pages/Register";
import Login from "./pages/Login";

// Dashboards
import DashboardV from "./pages/Volunteers/Dashboard_V";
import DashboardA from "./pages/Admin/Dashboard_A";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public pages using DefaultPage (regular header/footer) */}
        <Route element={<DefaultPage />}>
          <Route index element={<Home />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="events" element={<Events />} />
        </Route>

        {/* Dashboards using volunteer layout */}
        <Route element={<DefaultPageVolunteer />}>
          <Route path="dashboardV" element={<DashboardV />} />
          <Route path="dashboardA" element={<DashboardA />} />
        </Route>

        {/* Pages without layout */}
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
