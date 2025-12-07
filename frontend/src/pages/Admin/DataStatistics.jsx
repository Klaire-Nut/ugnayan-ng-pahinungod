import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
} from "@mui/material";

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

import {
  FaCalendarCheck,
  FaCheckCircle,
  FaTimesCircle,
  FaFire,
} from "react-icons/fa";

import { getAdminDataStatistics } from "../../services/adminApi";


export default function DataStatistics() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getAdminDataStatistics()
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => console.error("Error loading statistics:", err));
  }, []);

  if (!stats) return <Typography>Loading...</Typography>;

  const {
    total_volunteers,
    total_events,
    total_active_volunteers,
    volunteer_growth_percentage,
    volunteers_by_affiliation,
  } = stats;
  
  /** PIE CHART DATA */
  const pieData = Object.values(
    volunteers_by_affiliation.reduce((acc, item) => {
      const normalized = (item.affiliation_type || "Unknown")
        .trim()
        .toLowerCase();

      const finalName = normalized
        .split(" ")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      if (!acc[finalName]) {
        acc[finalName] = { name: finalName, value: 0 };
      }

      acc[finalName].value += item.count;

      return acc;
    }, {})
  );


  /** BAR CHART DATA */
  const barData = [
    { name: "Total Events", value: total_events },
    { name: "Active Volunteers", value: total_active_volunteers },
  ];

  /** CUSTOM COLORS */
  const COLORS = ["#7b1d1d", "#a43f3f", "#d88383", "#e1aaaa"];

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
              {total_events}
            </Typography>
            <Typography variant="body2">Total Events</Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Card sx={{ p: 2, borderRadius: "12px", textAlign: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#ff9800" }}>
              {total_active_volunteers}
            </Typography>
            <Typography variant="body2">Active Volunteers</Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Card sx={{ p: 2, borderRadius: "12px", textAlign: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#2e7d32" }}>
              {volunteer_growth_percentage}%
            </Typography>
            <Typography variant="body2">Volunteer Growth</Typography>
          </Card>
        </Grid>

        <Grid size={{ xs: 6, md: 3 }}>
          <Card sx={{ p: 2, borderRadius: "12px", textAlign: "center" }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#7b1d1d" }}>
              {total_volunteers}
            </Typography>
            <Typography variant="body2">Total Volunteers</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* MAIN CHARTS */}
      <Grid container spacing={2}>
        {/* BAR CHART */}
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
                Event & Volunteer Summary
              </Typography>
              <Typography sx={{ color: "#777", mb: 2 }}>
                Overview of event counts and volunteer participation.
              </Typography>

              <Box sx={{ width: "100%", height: 428 }}>
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

        {/* PIE CHART */}
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
                {total_volunteers}
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
