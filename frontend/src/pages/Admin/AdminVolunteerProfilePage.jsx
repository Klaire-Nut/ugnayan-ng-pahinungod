import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  Button,
  TextField,
} from "@mui/material";
import VolunteeringHistoryTable from "../../components/VolunteeringHistoryTable";
import "../../styles/AdminVolunteerProfile.css";

export default function AdminVolunteerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Replace this with real backend fetch
  const [volunteer, setVolunteer] = useState(null);
  const [history, setHistory] = useState([]);

  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    // TODO: Replace with API call
    const fetchVolunteer = async () => {
      const fake = {
        id,
        firstName: "Juan",
        middleName: "Santos",
        lastName: "Dela Cruz",
        age: 21,
        affiliation: "UP Mindanao",
        birthdate: "2003-08-10",
        sex: "Male",
        email: "juan@example.com",
        mobileNumber: "09123456789",
        address: "Davao City",
        volunteerID: "UNP11252025-02",
        profilePhoto:
          "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      };

      const fakeHistory = [
        { event: "Tree Planting", date: "2025-11-10", timeIn: "08:00 AM", timeOut: "12:00 PM", timeAllotted: "4h" },
        { event: "Cleanup Drive", date: "2025-11-15", timeIn: "09:00 AM", timeOut: "01:00 PM", timeAllotted: "4h" },
      ];

      setVolunteer(fake);
      setForm(fake);
      setHistory(fakeHistory);
    };

    fetchVolunteer();
  }, [id]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    console.log("Save updated volunteer:", form);

    // TODO: send update to backend (PATCH)
    setVolunteer(form);
    setEditMode(false);
  };

  if (!volunteer) return <div>Loading...</div>;

  return (
    <Box className="admin-vol-profile fade-in">
      
      {/* BACK BUTTON */}
      <Button
        variant="outlined"
        sx={{ mb: 2 }}
        onClick={() => navigate("/admin/volunteers")}
      >
        ← Back to Volunteers
      </Button>

      {/* HEADER */}
      <Box className="header-flex">
        <Typography variant="h4" fontWeight="bold">
          Volunteer Profile
        </Typography>

        {editMode ? (
          <Box>
            <Button
              variant="text"
              onClick={() => setEditMode(false)}
              sx={{ mr: 1 }}
            >
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSave}>
              Save Changes
            </Button>
          </Box>
        ) : (
          <Button variant="contained" onClick={() => setEditMode(true)}>
            Edit
          </Button>
        )}
      </Box>

      {/* PROFILE CARD */}
      <Card sx={{ mt: 2, p: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <img
              src={volunteer.profilePhoto}
              alt="Profile"
              className="admin-vol-photo"
            />
            <Typography
              variant="h6"
              align="center"
              mt={1}
              fontWeight={600}
            >
              {volunteer.volunteerID}
            </Typography>
          </Grid>

          <Grid item xs={12} md={9}>
            <Grid container spacing={2}>
              {[
                ["First Name", "firstName"],
                ["Middle Name", "middleName"],
                ["Last Name", "lastName"],
                ["Age", "age"],
                ["Sex", "sex"],
                ["Birthdate", "birthdate"],
                ["Email", "email"],
                ["Mobile Number", "mobileNumber"],
                ["Address", "address"],
                ["Affiliation", "affiliation"],
              ].map(([label, key]) => (
                <Grid item xs={12} sm={6} key={key}>
                  {editMode ? (
                    <TextField
                      label={label}
                      fullWidth
                      value={form[key] || ""}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                  ) : (
                    <Box className="info-box">
                      <strong>{label}: </strong>
                      {volunteer[key]}
                    </Box>
                  )}
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Card>

      {/* HISTORY SECTION */}
      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Volunteering History
      </Typography>

      <Card sx={{ p: 2 }}>
        <VolunteeringHistoryTable data={history} />
      </Card>
    </Box>
  );
}
