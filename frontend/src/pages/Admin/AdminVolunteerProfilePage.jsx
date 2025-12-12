import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  Avatar
} from "@mui/material";

import {
  adminGetVolunteer,
  adminUpdateVolunteer,
  adminGetVolunteerHistory
} from "../../services/adminApi";

import ProfileForm from "../../components/ProfileForm";
import VolunteeringHistoryTable from "../../components/VolunteeringHistoryTable";

import "../../styles/AdminVolunteerProfile.css";

export default function AdminVolunteerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [tempData, setTempData] = useState(null);
  const [history, setHistory] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [totalHours, setTotalHours] = useState(0);

  // Normalize admin API → frontend shape for ProfileForm
  const normalizeVolunteer = (v) => {
    return {
      volunteer: {
        first_name: v.first_name,
        middle_name: v.middle_name,
        last_name: v.last_name,
        nickname: v.nickname,
        sex: v.sex,
        birthdate: v.birthdate,
        email: v.email,
      },
      contact: v.contacts?.[0] || {},
      address: v.addresses?.[0] || {},
      background: v.backgrounds?.[0] || {},
      emergency_contact: v.emergency_contacts?.[0] || {},
      affiliation_data: v.affiliation_data || [],
      program_interests: v.program_interests || [],
      volunteer_identifier: v.volunteer_identifier,
      profile_picture: v.profile_picture,
    };
  };

  const loadVolunteer = async () => {
    const data = await adminGetVolunteer(id);
    const normalized = normalizeVolunteer(data);
    setProfile(normalized);
    setTempData(normalized);
  };

  const loadHistory = async () => {
    const hist = (await adminGetVolunteerHistory(id)) || [];

    const formatted = hist.map(h => ({
      event: h.event_name,
      date: h.date,
      schedule: `${h.start_time} - ${h.end_time}`,
      timeAllotted: `${h.hours_rendered} hrs`,
      hours_rendered: h.hours_rendered
    }));

    setHistory(formatted);

    // Compute total hours
    const total = formatted.reduce((sum, h) => sum + Number(h.hours_rendered || 0), 0);
    setTotalHours(total);
  };

  useEffect(() => {
    loadVolunteer();
    loadHistory();
  }, [id]);

  const handleChange = (key, value) => {
    setTempData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      await adminUpdateVolunteer(id, tempData);
      alert("Profile updated successfully!");
      setProfile(tempData);
      setEditMode(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save changes.");
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <Box className="admin-vol-profile-page" sx={{ paddingBottom: 4 }}>

      {/* BACK BUTTON */}
      <Button
        variant="outlined"
        onClick={() => navigate("/admin/volunteers")}
        sx={{
          mb: 2,
          borderColor: "#7b1d1d",
          color: "#7b1d1d",
          "&:hover": { backgroundColor: "#7b1d1d", color: "white" },
        }}
      >
        ← Back to Volunteers
      </Button>

      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          gap: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Volunteer Profile
        </Typography>

        <Box>
          {!editMode ? (
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#7b1d1d",
                "&:hover": { backgroundColor: "#5c1515" },
              }}
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                sx={{ mr: 1 }}
                onClick={() => {
                  setTempData(profile);
                  setEditMode(false);
                }}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                sx={{ backgroundColor: "#7b1d1d" }}
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* PROFILE CARD */}
      <Card sx={{ p: 3, mb: 4, boxShadow: 3 }}>
        <Grid container spacing={3}>

          {/* LEFT PANE */}
          <Grid item xs={12} md={3} sx={{ textAlign: "center" }}>
            <Avatar
              src={profile.profile_picture || "/default-profile.png"}
              sx={{
                width: 180,
                height: 180,
                margin: "0 auto",
                border: "4px solid #e0e0e0",
              }}
            />
            <Typography
              variant="h6"
              sx={{ mt: 2, fontWeight: 700, color: "#7b1d1d" }}
            >
              {profile.volunteer_identifier}
            </Typography>
          </Grid>

          {/* RIGHT PANE FORM */}
          <Grid item xs={12} md={9}>
            <CardContent>
              <ProfileForm
                data={editMode ? tempData : profile}
                editable={editMode}
                onChange={handleChange}
              />
            </CardContent>
          </Grid>

        </Grid>
      </Card>

      {/* VOLUNTEERING HISTORY */}
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
        Volunteering History
      </Typography>

      <Typography 
        variant="h6" 
        sx={{ mb: 2, fontWeight: 700, color: "#7b1d1d" }}
      >
        Total Rendered Hours: {totalHours} hrs
      </Typography>

      <Card sx={{ p: 3, boxShadow: 3 }}>
        <VolunteeringHistoryTable data={history} />
      </Card>
    </Box>
  );
}
