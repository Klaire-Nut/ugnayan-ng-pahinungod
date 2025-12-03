import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";   // 🔥 make sure this is here

// Layouts
import DefaultPage from "./layout/default_page";
import DefaultPageVolunteer from "./layout/default_page_volunteers";
import DefaultPageAdmin from "./layout/default_page_admin";

// Public Pages
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import Events from "./pages/Events";
import Register from "./pages/Register/Register.jsx";
import Login from "./pages/Login";

// Volunteer Pages
import VolunteerDashboard from "./pages/Volunteers/Dashboard_V";
import VolunteerEvents from "./pages/Volunteers/VolunteerEvents";
import VolunteerProfile from "./pages/Volunteers/VolunteerProfile";
import VolunteeringHistory from "./pages/Volunteers/VolunteeringHistory";
import PrivacySettings from "./pages/Volunteers/PrivacySettings";

// Admin Pages
import AdminDashboard from "./pages/Admin/Dashboard_A";
import AdminEvents from "./pages/Admin/AdminEvents.jsx";
import EventDetails from "./pages/Admin/EventDetails";
import AdminVolunteers from "./pages/Admin/AdminVolunteers";
import DataStatistics from "./pages/Admin/DataStatistics";
import AdminSettings from "./pages/Admin/AdminSettings.jsx";

function App() {
  return (
    <AuthProvider>      {/* 🔥 CRITICAL: wraps everything */}

      <Router>
        <Routes>

          {/* PUBLIC ROUTES */}
          <Route element={<DefaultPage />}>
            <Route index element={<Home />} />
            <Route path="about" element={<AboutUs />} />
            <Route path="events" element={<Events />} />
            <Route path="register" element={<Register />} />
            <Route path="login" element={<Login />} />
          </Route>

          {/* VOLUNTEER ROUTES */}
          <Route path="/volunteer" element={<DefaultPageVolunteer />}>
            <Route index element={<VolunteerDashboard />} />
            <Route path="dashboard" element={<VolunteerDashboard />} />
            <Route path="/volunteer/events" element={<VolunteerEvents />} />
            <Route path="profile" element={<VolunteerProfile />} />
            <Route path="history" element={<VolunteeringHistory />} />
            <Route path="privacy" element={<PrivacySettings />} />
          </Route>

          {/* ADMIN ROUTES */}
          <Route path="/admin" element={<DefaultPageAdmin />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="events/:id/edit" element={<AdminEvents />} />
            <Route path="events/:id" element={<EventDetails />} />
            <Route path="volunteers" element={<AdminVolunteers />} />
            <Route path="stats" element={<DataStatistics />} />
            <Route path="privacy" element={<AdminSettings />} />
          </Route>

        </Routes>
      </Router>

    </AuthProvider>
  );
}

export default App;
