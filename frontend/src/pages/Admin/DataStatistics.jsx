import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
} from "@mui/material";

import {
  FaCalendarCheck,
  FaCheckCircle,
  FaTimesCircle,
  FaFire,
} from "react-icons/fa";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

import { useOutletContext } from "react-router-dom";

export default function DataStatistics() {
  const { events = [], volunteers = [] } = useOutletContext();

  const computeEventStatus = (event) => {
    const today = new Date().toISOString().slice(0, 10);

    if (event.is_cancelled) return "cancelled";
    if (today < event.date_start) return "upcoming";
    if (today > event.date_end) return "done";
    return "happening";
  };

  const normalizedEvents = events.map(e => ({
    ...e,
    normalizedStatus: computeEventStatus(e),
  }));

  const totalEvents = normalizedEvents.length;
  const upcoming = normalizedEvents.filter(e => e.normalizedStatus === "upcoming").length;
  const happening = normalizedEvents.filter(e => e.normalizedStatus === "happening").length;
  const done = normalizedEvents.filter(e => e.normalizedStatus === "done").length;
  const cancelled = normalizedEvents.filter(e => e.normalizedStatus === "cancelled").length;

  const totalVolunteers = volunteers.length;

  const affiliationCounts = useMemo(() => {
    const map = {};
    volunteers.forEach((v) => {
      const aff = v.affiliation || "Unspecified";
      map[aff] = (map[aff] || 0) + 1;
    });
    return map;
  }, [volunteers]);

  const pieData = Object.keys(affiliationCounts).map((key) => ({
    name: key,
    value: affiliationCounts[key],
  }));

  const barData = [
    { name: "Upcoming", value: upcoming },
    { name: "Happening", value: happening },
    { name: "Done", value: done },
    { name: "Cancelled", value: cancelled },
  ];

  const COLORS = ["#7b1d1d", "#a43f3f", "#d88383"];

  return (
    <Box sx={{ paddingRight: "20px" }}>
      
      {/* HEADER */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#7b1d1d" }}>
          Data & Statistics
        </Typography>
        <Typography sx={{ color: "#666" }}>
          Overview of event performance and volunteer demographics.
        </Typography>
      </Box>

      {/* KPI QUICK STATS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Card sx={{ p: 2, borderRadius: "12px", textAlign: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#7b1d1d" }}>
              {totalEvents}
            </Typography>
            <Typography variant="body2">Total Events</Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Card sx={{ p: 2, borderRadius: "12px", textAlign: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#ff9800" }}>
              {happening}
            </Typography>
            <Typography variant="body2">Happening Events</Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Card sx={{ p: 2, borderRadius: "12px", textAlign: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#2e7d32" }}>
              {upcoming}
            </Typography>
            <Typography variant="body2">Upcoming Events</Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Card sx={{ p: 2, borderRadius: "12px", textAlign: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#7b1d1d" }}>
              {totalVolunteers}
            </Typography>
            <Typography variant="body2">Volunteers</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* MAIN CARDS */}
      <Grid container spacing={2}>

        {/* EVENT SUMMARY */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              borderRadius: "14px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
              borderLeft: "5px solid #7b1d1d",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Event Summary
              </Typography>
              <Typography sx={{ color: "#777", mb: 2 }}>
                Breakdown of all events by status.
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Chip label={`Upcoming: ${upcoming}`} icon={<FaCalendarCheck />} sx={{ mr: 1 }} />
                <Chip label={`Happening: ${happening}`} icon={<FaFire />} sx={{ mr: 1 }} />
                <Chip label={`Done: ${done}`} icon={<FaCheckCircle />} sx={{ mr: 1 }} />
                <Chip label={`Cancelled: ${cancelled}`} icon={<FaTimesCircle />} />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ width: "100%", height: 200, minWidth: 0 }}>
                <ResponsiveContainer>
                  <BarChart data={barData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#7b1d1d" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* VOLUNTEER PIE CHART */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              borderRadius: "14px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
              borderLeft: "5px solid #7b1d1d",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Volunteer Demographics
              </Typography>
              <Typography sx={{ color: "#777", mb: 1 }}>
                Distribution of volunteers by affiliation.
              </Typography>

              <Typography variant="h4" sx={{ fontWeight: 700, color: "#7b1d1d" }}>
                {totalVolunteers}
              </Typography>

              <Typography variant="body2">Registered Volunteers</Typography>

              <Box sx={{ width: "100%", height: 200 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              <Divider sx={{ my: 2 }} />

              {pieData.map((item, i) => (
                <Typography key={i} sx={{ mb: 0.5 }}>
                  • {item.name}: <b>{item.value}</b>
                </Typography>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}