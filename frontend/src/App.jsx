import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DefaultPage from "./layout/default_page"; // ✅ layout folder
import Home from "./pages/Home";
import AboutUs from "./pages/AboutUs";
import Events from "./pages/Events";
import Register from "./pages/Register";
import Login from "./pages/Login";

function App() {
  return (
    <Router>
      <Routes>
        {/* Pages with header/footer */}
        <Route element={<DefaultPage />}>
          <Route index element={<Home />} />          {/* "/" */}
          <Route path="about" element={<AboutUs />} /> {/* "/about" */}
          <Route path="events" element={<Events />} /> {/* "/events" */}
        </Route>

        {/* Auth pages (no header/footer) */}
        <Route path="register" element={<Register />} /> {/* "/register" */}
        <Route path="login" element={<Login />} />       {/* "/login" */}
      </Routes>
    </Router>
  );
}

export default App;
// ❌ REMOVE that random 's' at the bottom!