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

import VolunteerDashboard from "./pages/Volunteers/Dashboard_V";
import VolunteerProfile from "./pages/Volunteers/VolunteerProfile";
import VolunteeringHistory from "./pages/Volunteers/VolunteeringHistory";
import PrivacySettings from "./pages/Volunteers/PrivacySettings"; 

import AdminEvents from "./pages/Admin/AdminEvents.jsx";
import EventDetails from "./pages/Admin/EventDetails";
import AdminVolunteers from "./pages/Admin/AdminVolunteers";
import DataStatistics from "./pages/Admin/DataStatistics";
import AdminSettings from "./pages/Admin/AdminSettings.jsx";
import AdminDashboard from "./pages/Admin/Dashboard_A";
import AdminVolunteerProfile from "./pages/Admin/AdminVolunteerProfile";

function App() {
  return (
    <Router>
      <Routes>

        {/* PUBLIC PAGES */}
        <Route element={<DefaultPage />}>
          <Route index element={<Home />} />
          <Route path="about" element={<AboutUs />} />
          <Route path="events" element={<Events />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
        </Route>

        {/* VOLUNTEER PAGES */}
        <Route path="/volunteer" element={<DefaultPageVolunteer />}>
          <Route index element={<VolunteerDashboard />} />
          <Route path="dashboard" element={<VolunteerDashboard />} />
          <Route path="events" element={<Events />} />
          <Route
            path="profile"
            element={
              <VolunteerProfile
                user={{
                  firstName: "John",
                  lastName: "Doe",
                  email: "john@example.com",
                  phone: "1234567890",
                  birthday: "1990-01-01",
                  address: "123 Street, City",
                  profilePhoto: "/path/to/default.jpg"
                }}
              />
            }
          />
          <Route path="history" element={<VolunteeringHistory />} />
          <Route path="privacy" element={<PrivacySettings />} /> {/* ✅ Fixed */}
        </Route>

        {/* ADMIN PAGES */}
        <Route path="/admin" element={<DefaultPageAdmin />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="events/:id/edit" element={<AdminEvents />} />
          <Route path="events/:id" element={<EventDetails />} />
          <Route path="volunteers" element={<AdminVolunteers />} />
          <Route path="volunteers/:volunteerId" element={<AdminVolunteerProfile />} />
          <Route path="stats" element={<DataStatistics />} />
          <Route path="privacy" element={<AdminSettings />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
