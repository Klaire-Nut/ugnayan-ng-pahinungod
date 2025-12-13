import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import VolunteerEventCard from "../../components/VolunteerEventCard";

import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
} from "@mui/material";

import { FaHistory, FaHandsHelping } from "react-icons/fa";

function getEventStatus(event) {
  const schedules = event.schedules || [];
  if (event.is_cancelled) return "CANCELLED";
  if (!schedules.length) return "UPCOMING";

  const now = new Date();
  const first = schedules[0];
  const last = schedules[schedules.length - 1];

  const start = new Date(`${first.date}T${first.start_time}`);
  const end = new Date(`${last.date}T${last.end_time}`);

  if (now < start) return "UPCOMING";
  if (now >= start && now <= end) return "HAPPENING";
  return "DONE";
}

export default function Dashboard_V() {
  const navigate = useNavigate();
  const { events = [], joinedEvents = [] } = useOutletContext();

  /* -----------------------------------------------------
     NORMALIZE EVENT STRUCTURE (same logic admin uses)
  ----------------------------------------------------- */
  const normalizeEvent = (ev) => {
    const schedules = (ev.schedules || []).map((s) => ({
      ...s,
      start_time: s.start_time ?? s.time_start ?? null,
      end_time: s.end_time ?? s.time_end ?? null,
      max_slots: Number(s.max_slots ?? s.slots ?? 0),
      filled_slots: Number(s.filled_slots ?? s.volunteers_count ?? 0),
    }));

    return { ...ev, schedules };
  };

  /* -----------------------------------------------------
     GET 3 MOST RECENT EVENTS
  ----------------------------------------------------- */
  const recentEvents = [...events]
    .map(normalizeEvent)
    .filter((e) => getEventStatus(e) !== "DONE")
    .sort((a, b) => b.event_id - a.event_id)
    .slice(0, 3);

  const checkJoined = (eventId, eventObj) =>
    eventObj.has_joined === true;

  return (
    <div className="admin-dashboard-wrapper fade-in" style={{ maxWidth: "1250px", margin: "0 auto" }}>

      {/* TITLE MATCHING ADMIN */}
      <h1 style={{ marginBottom: "25px", color: "#7b1d1d" }}>
        Volunteer Dashboard
      </h1>

      {/* =====================================================
          CURRENT EVENTS (MATCHED TO ADMIN DASHBOARD)
      ===================================================== */}
      <section className="events-section fade-in">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>CURRENT EVENTS</h2>

          <button
            onClick={() => navigate("/volunteer/events")}
            className="link-button"
          >
            View all events →
          </button>
        </div>

        <div className="events-grid">
          {recentEvents.length === 0 ? (
            <p>No events available.</p>
          ) : (
            recentEvents.map((ev) => (
              <VolunteerEventCard
                key={ev.event_id}
                event={normalizeEvent(ev)}
                isJoined={checkJoined(ev.event_id, ev)}
                onOpen={() => navigate(`/volunteer/events/${ev.event_id}`)}
              />
            ))
          )}
        </div>
      </section>

      {/* =====================================================
          QUICK ACTIONS (MATCHED AS SECOND SECTION)
      ===================================================== */}
      <section className="volunteers-section fade-in" style={{ marginTop: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ margin: 0 }}>QUICK ACTIONS</h2>
        </div>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: "18px",
                p: 2,
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                transition: ".25s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 28px rgba(0,0,0,0.15)",
                },
              }}
              onClick={() => navigate("/volunteer/events-joined")}
            >
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <FaHandsHelping size={32} color="#7b1d1d" />
                <Box>
                  <Typography fontWeight="bold">Events Joined</Typography>
                  <Typography sx={{ color: "#666" }}>
                    View events you are currently participating in
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: "18px",
                p: 2,
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                transition: ".25s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 28px rgba(0,0,0,0.15)",
                },
              }}
              onClick={() => navigate("/volunteer/history")}
            >
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <FaHistory size={32} color="#7b1d1d" />
                <Box>
                  <Typography fontWeight="bold">Volunteering History</Typography>
                  <Typography sx={{ color: "#666" }}>
                    Review your completed volunteer activities
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </section>
    </div>
  );
}