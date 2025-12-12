// src/pages/Register/Step4.jsx
import React, { useState, useCallback } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";

export default function Step4({
  formData = {},
  setFormData,
  onBack,
  onSubmit,
  onOpenLogin,
}) {
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [password, setPassword] = useState(formData.password || "");
  const [confirmPassword, setConfirmPassword] = useState(
    formData.confirmPassword || ""
  );

  const [confirmDialog, setConfirmDialog] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Input handlers
  const handleChange = useCallback((setter) => (e) => setter(e.target.value), []);

  // Validation
  const validate = useCallback(() => {
    const newErrors = {};

    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters.";

    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password.";

    if (password && confirmPassword && password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [password, confirmPassword]);

  const handleSubmitClick = () => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setConfirmDialog(true);
  };

  // ------------------------------
  // SUBMIT REGISTRATION
  // ------------------------------
  const handleConfirmSubmit = async () => {
    setConfirmDialog(false);
    setLoading(true);

    const emptyIfNull = (val) => val || "";

    const normalizeAffiliation = (aff) => {
      switch (aff) {
        case "STUDENT": return "student";
        case "FACULTY": return "faculty";
        case "ALUMNI": return "alumni";
        case "UP STAFF": return "staff";
        case "RETIREE": return "retiree";
        default: return "";
      }
    };

    // ------------------------------
    // Build payload for backend (updated field names)
    // ------------------------------
    const payload = {
      account: {
        email: emptyIfNull(formData.email),
        password: emptyIfNull(password),
      },
      volunteer: {
        first_name: emptyIfNull(formData.firstName),
        middle_name: emptyIfNull(formData.middleName),
        last_name: emptyIfNull(formData.lastName),
        nickname: emptyIfNull(formData.nickname),
        sex: emptyIfNull(formData.sex),
        birthdate: formData.birthdate
          ? new Date(formData.birthdate).toISOString().split("T")[0]
          : null,
        affiliation_type: normalizeAffiliation(formData.affiliation),
      },
      contact: {
        mobile_number: emptyIfNull(formData.mobileNumber),
        facebook_link: emptyIfNull(formData.facebookLink),
      },
      address: {
        street_address: emptyIfNull(formData.streetBarangay),
        province: emptyIfNull(formData.province),
        region: emptyIfNull(formData.region),
      },
      background: {
        occupation: emptyIfNull(formData.occupation),
        org_affiliation: emptyIfNull(formData.organizations),
        hobbies_interests: emptyIfNull(formData.hobbies),
      },
      emergency_contact: {
        name: emptyIfNull(formData.emerName),
        relationship: emptyIfNull(formData.emerRelation),
        contact_number: emptyIfNull(formData.emerContact),
        address: emptyIfNull(formData.emerAddress),
      },
      affiliation_data: {}, // will fill below
      program_interests: Array.isArray(formData.program_interests)
        ? formData.program_interests
        : [],
    };

    // ------------------------------
    // Affiliation profiles (unified field names)
    // ------------------------------
    switch (formData.affiliation) {
      case "STUDENT":
        payload.affiliation_data = {
          degree_program: formData.degreeProgram,
          year_level: formData.yearLevel,
          college: formData.college,
        };
        break;

      case "ALUMNI":
        payload.affiliation_data = {
          constituent_unit: formData.constituentUnit,
          degree_program: formData.alumniDegree,
          year_graduated: formData.yearGrad,
        };
        break;

      case "UP STAFF":
        payload.affiliation_data = {
          office_department: formData.staffOffice,
          designation: formData.staffPosition,
        };
        break;

      case "FACULTY":
        payload.affiliation_data = {
          department: formData.facultyDept,
        };
        break;

      case "RETIREE":
        payload.affiliation_data = {
          designation: formData.retireDesignation,
          office: formData.retireOffice,
        };
        break;
    }

    // ------------------------------
    // Submit
    // ------------------------------
    try {
      console.log("Submitting payload:", payload);
      await onSubmit(payload);
      setLoading(false);
      setSuccessDialog(true);
    } catch (error) {
      setLoading(false);
      console.error("Registration failed:", error);

      const message =
        error.error ||
        (error.errors ? JSON.stringify(error.errors) : null) ||
        "Registration failed. Please check your input.";

      alert(message);
    }
  };

  // After success → close dialog and open login modal
  const handleSuccessClose = () => {
    setSuccessDialog(false);
    onOpenLogin("Volunteer");
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Set Your Password
      </Typography>

      <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
        Create a secure password for your account. Your password must be at
        least 8 characters long.
      </Typography>

      <TextField
        fullWidth
        label="Password *"
        type="password"
        value={password}
        onChange={handleChange(setPassword)}
        error={!!errors.password}
        helperText={errors.password}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Confirm Password *"
        type="password"
        value={confirmPassword}
        onChange={handleChange(setConfirmPassword)}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
        sx={{ mb: 2 }}
      />

      {/* Navigation */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button variant="outlined" onClick={onBack}>
          Back
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmitClick}
          sx={{
            backgroundColor: "#FF7F00",
            "&:hover": { backgroundColor: "#e66e00" },
          }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Submit"}
        </Button>
      </Box>

      {/* Confirm Submit Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirm Submission</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit your registration? Please review
            all information before confirming.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmSubmit} variant="contained">
            {loading ? <CircularProgress size={24} /> : "Yes, Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialog} onClose={handleSuccessClose}>
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: "#4CAF50", mb: 2 }} />

          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: "#4CAF50" }}>
            SUBMITTED
          </Typography>

          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            THANK YOU FOR SIGNING-UP/UPDATING YOUR INFORMATION!
          </Typography>

          <Typography sx={{ fontStyle: "italic", mb: 2 }}>
            Makibahagi. Maglingkod. MagPahinungód.
          </Typography>

          <Box sx={{ textAlign: "left", mx: "auto", maxWidth: 400 }}>
            <Typography>
              <strong>Email:</strong> pahinungod.upmin@up.edu.ph
            </Typography>
            <Typography>
              <strong>Facebook:</strong>{" "}
              <a
                href="https://www.facebook.com/upmin.pahinungod"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#1976d2" }}
              >
                facebook.com/upmin.pahinungod
              </a>
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleSuccessClose} variant="contained" fullWidth>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}