// src/pages/Register/Step3.jsx
import React, { useState, memo, useCallback } from "react";
import {
  Box,
  Select,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Typography,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { registerVolunteer } from "../../services/volunteerApi.js";


// ----------------- Reusable Components -----------------
const FormSelect = memo(({ label, value, onChange, options = [], error }) => (
  <FormControl fullWidth sx={{ mb: 2 }} error={!!error}>
    <InputLabel>{label}</InputLabel>
    <Select value={value} label={label} onChange={onChange}>
      {options.map((opt) => (
        <MenuItem key={opt} value={opt}>
          {opt}
        </MenuItem>
      ))}
    </Select>
    {error && <Typography color="error" variant="body2">{error}</Typography>}
  </FormControl>
));
FormSelect.displayName = "FormSelect";

const FormTextField = memo(({ label, value, onChange, error, multiline = false, rows = 1, type }) => (
  <TextField
    fullWidth
    label={label}
    value={value}
    onChange={onChange}
    error={!!error}
    helperText={error}
    multiline={multiline}
    minRows={multiline ? rows : undefined}
    sx={{ mb: 2 }}
    type={type}
  />
));
FormTextField.displayName = "FormTextField";

// ----------------- Main Component -----------------
export default function Step3({ formData = {}, setFormData, onBack /* onSubmit not used here */ }) {
  const [errors, setErrors] = useState({});
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);

  const safeFormData = {
    volunteerPrograms: [],
    affirmativeActionSubjects: [],
    volunteerStatus: "",
    tagapagUgnay: "",
    otherOrganization: "",
    organizationName: "",
    howDidYouHear: "",
    password: "",
    ...formData,
  };

  // ----------------- Change Handlers -----------------
  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, [setFormData]);

  const handleCheckboxChange = useCallback((field, value) => {
    setFormData((prev) => {
      const currentValues = prev[field] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  }, [setFormData]);

  // ----------------- Validation -----------------
  const validate = useCallback(() => {
    const newErrors = {};

    if (!safeFormData.volunteerPrograms || safeFormData.volunteerPrograms.length === 0)
      newErrors.volunteerPrograms = "Please select at least one program.";

    if (!safeFormData.volunteerStatus)
      newErrors.volunteerStatus = "This field is required.";

    if (!safeFormData.tagapagUgnay)
      newErrors.tagapagUgnay = "This field is required.";

    if (!safeFormData.otherOrganization)
      newErrors.otherOrganization = "This field is required.";

    if (safeFormData.otherOrganization === "YES" && !safeFormData.organizationName)
      newErrors.organizationName = "Please provide the organization name.";

    if (safeFormData.volunteerStatus === "First time to apply as volunteer (no engagements yet)" && !safeFormData.howDidYouHear)
      newErrors.howDidYouHear = "This field is required for first-time volunteers.";

    if (!safeFormData.password)
      newErrors.password = "Please provide a password.";

    // ensure email exists (email comes from Step1)
    if (!safeFormData.email)
      newErrors.email = "Email is required (from Step 1).";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [safeFormData]);

  // ----------------- Submit Handlers -----------------
  const handleSubmitClick = () => {
    // Ensure email + password are present first
    if (!safeFormData.email || !safeFormData.password) {
      alert("Email and password are required.");
      return;
    }

    // Optional: run your other form validations
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setConfirmDialog(false);
    setLoading(true);

    try {
      // Flattened payload: email & password at top level; all volunteer fields also top-level
      const payload = {
        email: safeFormData.email,
        password: safeFormData.password,

        // Volunteer profile fields (flattened)
        first_name: safeFormData.firstName || "",
        middle_name: safeFormData.middleName || "",
        last_name: safeFormData.lastName || "",
        nickname: safeFormData.nickname || "",
        // Ensure sex matches backend choices
        sex: safeFormData.sex === "Male" ? "M" : safeFormData.sex === "Female" ? "F" : "",

        // Ensure birthdate is in YYYY-MM-DD format
        birthdate: safeFormData.birthdate
          ? new Date(safeFormData.birthdate).toISOString().split("T")[0]
          : "",

        volunteer_programs: safeFormData.volunteerPrograms || [],
        affirmative_action_subjects:
          safeFormData.affirmativeActionSubjects || [],
        volunteer_status: safeFormData.volunteerStatus || "",
        tagapag_ugnay: safeFormData.tagapagUgnay || "",
        other_organization: safeFormData.otherOrganization || "",
        organization_name: safeFormData.organizationName || "",
        how_did_you_hear: safeFormData.howDidYouHear || "",
        mobile_number: safeFormData.mobileNumber || "",
        facebook_link: safeFormData.facebookLink || "",
        street_address: safeFormData.streetBarangay || "",
        province: safeFormData.province || "",
        region: safeFormData.region || "",
        degree_program: safeFormData.degreeProgram || "",
        year_level: safeFormData.yearLevel || "",
        college: safeFormData.college || "",
        department: safeFormData.department || "",
        year_graduated: safeFormData.yearGraduated || "",
        emer_name: safeFormData.emerName || "",
        emer_relation: safeFormData.emerRelation || "",
        emer_contact: safeFormData.emerContact || "",
        emer_address: safeFormData.emerAddress || "",
        occupation: safeFormData.occupation || "",
        org_affiliation: safeFormData.organizations || [],
        hobbies_interests: safeFormData.hobbies || [],
        affiliation: safeFormData.affiliation || "STUDENT"
      };

      // debug log - inspect what you're sending
      console.log("Payload being sent:", payload);

      const res = await registerVolunteer(payload); // your API call
      console.log("Final registration response:", res.data);
      setSuccessDialog(true);
    } catch (error) {
      // better error message handling
      console.error("Final registration error:", error);

      // backend error response (axios)
      const backendMessage =
        error?.response?.data || error?.response?.data?.detail || null;

      alert(
        backendMessage?.error ||
          backendMessage?.detail ||
          "Something went wrong during registration."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessDialog(false);
    window.location.href = "/";
  };


  // ----------------- Render -----------------
  const volunteerProgramOptions = [
    "AFFIRMATIVE ACTION PROGRAM",
    "TEACHER DEVELOPMENT PROGRAM",
    "DISASTER RISK REDUCTION RELATED PROGRAM",
    "UGNAYAN NG PAHINUNGOD ONLINE PROGRAM",
    "TUTORIAL SERVICES PROGRAM",
    "ENVIRONMENTAL AWARENESS PROGRAM",
    "PROGRAMS UNDER THE UP BARMM-MBHTE MOU",
  ];

  const affirmativeActionSubjects = [
    "READING COMPREHENSION FILIPINO",
    "READING COMPREHENSION ENGLISH",
    "LANGUAGE PROFICIENCY FILIPINO",
    "LANGUAGE PROFICIENCY ENGLISH",
    "MATHEMATICS",
    "SCIENCE",
    "NONE",
  ];

  const isFirstTimeVolunteer = safeFormData.volunteerStatus === "First time to apply as volunteer (no engagements yet)";

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>PROGRAMS YOU WISH TO PARTICIPATE IN</Typography>

      {/* Volunteer Programs */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ mb: 1, fontWeight: 500 }}>VOLUNTEER PROGRAMS *</Typography>
        <FormGroup>
          {volunteerProgramOptions.map((program) => (
            <FormControlLabel
              key={program}
              control={
                <Checkbox
                  checked={safeFormData.volunteerPrograms.includes(program)}
                  onChange={() => handleCheckboxChange("volunteerPrograms", program)}
                />
              }
              label={program}
            />
          ))}
        </FormGroup>
        {errors.volunteerPrograms && <Typography color="error">{errors.volunteerPrograms}</Typography>}
      </Box>

      {/* Affirmative Action Subjects */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ mb: 1, fontWeight: 500 }}>
          Under the AFFIRMATIVE ACTION PROGRAM, which subjects are you interested in teaching?
        </Typography>
        <FormGroup>
          {affirmativeActionSubjects.map((subject) => (
            <FormControlLabel
              key={subject}
              control={
                <Checkbox
                  checked={safeFormData.affirmativeActionSubjects.includes(subject)}
                  onChange={() => handleCheckboxChange("affirmativeActionSubjects", subject)}
                />
              }
              label={subject}
            />
          ))}
        </FormGroup>
      </Box>

      {/* Volunteer Status */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ mb: 1, fontWeight: 500 }}>Kindly choose the status of your volunteer application *</Typography>
        <FormSelect
          label="Volunteer Status"
          value={safeFormData.volunteerStatus}
          onChange={(e) => handleChange("volunteerStatus", e.target.value)}
          options={[
            "First time to apply as volunteer (no engagements yet)",
            "Already signed up in the previous sign up form but no engagements yet",
            "Signed up in the previous sign up form and already have engagements with Pahinungod",
          ]}
          error={errors.volunteerStatus}
        />
      </Box>

      {/* Tagapag-Ugnay Group */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ mb: 1, fontWeight: 500 }}>Would you like to be part of the TAGAPAG-UGNAY Group?</Typography>
        <FormSelect
          label="Join Tagapag-Ugnay Group"
          value={safeFormData.tagapagUgnay}
          onChange={(e) => handleChange("tagapagUgnay", e.target.value)}
          options={["YES", "NO"]}
          error={errors.tagapagUgnay}
        />
      </Box>

      {/* Other Organization */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ mb: 1, fontWeight: 500 }}>Are you a part of any other volunteer organization? *</Typography>
        <FormSelect
          label="Part of Other Organization"
          value={safeFormData.otherOrganization}
          onChange={(e) => handleChange("otherOrganization", e.target.value)}
          options={["YES", "NO"]}
          error={errors.otherOrganization}
        />
      </Box>

      {/* Organization Name */}
      {safeFormData.otherOrganization === "YES" && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ mb: 1, fontWeight: 500 }}>What is the name of the organization?</Typography>
          <FormTextField
            label="Organization Name"
            value={safeFormData.organizationName}
            onChange={(e) => handleChange("organizationName", e.target.value)}
            error={errors.organizationName}
          />
        </Box>
      )}

      {/* How Did You Hear */}
      {isFirstTimeVolunteer && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ mb: 1, fontWeight: 500 }}>Where did you hear about us?</Typography>
          <FormTextField
            label="How did you hear about us?"
            value={safeFormData.howDidYouHear}
            onChange={(e) => handleChange("howDidYouHear", e.target.value)}
            error={errors.howDidYouHear}
            multiline
            rows={2}
          />
        </Box>
      )}

      {/* Account Details */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>ACCOUNT DETAILS</Typography>
        <FormTextField
          label="Password"
          type="password"
          value={safeFormData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          error={errors.password}
        />
      </Box>

      {/* Navigation */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button variant="outlined" onClick={onBack}>Back</Button>
        <Button
          variant="contained"
          onClick={handleSubmitClick}
          disabled={loading}
          sx={{ backgroundColor: "#FF7F00", "&:hover": { backgroundColor: "#e66e00" } }}
        >
          {loading ? <CircularProgress size={24} /> : "Submit"}
        </Button>
      </Box>


      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirm Submission</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to register as a volunteer?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmSubmit} variant="contained" color="primary">Yes, Continue</Button>
        </DialogActions>
      </Dialog>


      {/* Success Dialog */}
      <Dialog open={successDialog} onClose={handleSuccessClose}>
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: "#4CAF50", mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: "#4CAF50" }}>SUBMITTED</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>THANK YOU FOR SIGNING-UP/UPDATING YOUR INFORMATION!</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSuccessClose} variant="contained" fullWidth>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
