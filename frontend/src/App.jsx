import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DefaultPage from "./layout/default_page";
import DefaultPageVolunteer from "./layout/default_page_volunteers";
import DefaultPageAdmin from "./layout/default_page_admin";


import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import Events from "./pages/Events";
import Register from "./pages/Register/Register.jsx";
import AuthTest from "./components/AuthTest";
import Login from "./pages/Login";
import VolunteerDashboard from "./pages/Volunteers/Dashboard_V.jsx";

//Admin
import AdminEvents from "./pages/Admin/AdminEvents.jsx";
import EventDetails from "./pages/Admin/EventDetails";
import AdminVolunteers from "./pages/Admin/AdminVolunteers";
import DataStatistics from "./pages/Admin/DataStatistics";
import PrivacySettings from "./pages/Admin/PrivacySettings";
import AdminDashboard from "./pages/Admin/Dashboard_A";

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

        {/* Dashboards using volunteer layout */}
        <Route element={<DefaultPageVolunteer />}>
          <Route path="dashboard" element={<VolunteerDashboard />} />
        </Route>

        {/* ADMIN PAGES */}
        <Route path="/admin" element={<DefaultPageAdmin />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="events/:id/edit" element={<AdminEvents />} />
          <Route path="events/:id" element={<EventDetails />} />
          <Route path="volunteers" element={<AdminVolunteers />} />
          <Route path="stats" element={<DataStatistics />} />
          <Route path="privacy" element={<PrivacySettings />} />
        </Route>

      </Routes>
    </Router>
  );
}
export default App;
