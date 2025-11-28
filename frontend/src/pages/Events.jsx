import React from "react";
import DefaultPage from "../layout/default_page.jsx"; // ✅ Your layout wrapper (includes sidebar)
import Sidebar from "../components/Sidebar.jsx";

const Events = () => {
  return (
      <main style={{ padding: "2rem" }}>
        <h1>Events</h1>
        <p>Upcoming and past events will be listed here.</p>
      </main>
  );
};

export default Events;