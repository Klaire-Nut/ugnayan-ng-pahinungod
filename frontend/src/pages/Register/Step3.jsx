// src/pages/Register/Step3.jsx - Backend OTP Version
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
  Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { sendOTP } from "../../services/volunteerApi";

// ----------------- Reusable Components -----------------
const FormSelect = memo(({ label, value, onChange, options = [], error, required = false }) => (
  <FormControl fullWidth sx={{ mb: 2 }} error={!!error}>
    <InputLabel>{label}</InputLabel>
    <Select value={value} label={label} onChange={onChange}>
      {options.map((opt) => (
        <MenuItem key={opt} value={opt}>
          {opt}
        </MenuItem>
      ))}
    </Select>
    {error && (
      <Typography color="error" variant="body2">
        {error}
      </Typography>
    )}
  </FormControl>
));
FormSelect.displayName = "FormSelect";

const FormTextField = memo(({ label, value, onChange, error, multiline = false, rows = 1 }) => (
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
  />
));
FormTextField.displayName = "FormTextField";

// ----------------- Main Component -----------------
export default function Step3({ formData = {}, setFormData, onBack, onSubmit }) {
  const [errors, setErrors] = useState({});
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [otpDialog, setOtpDialog] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [generatedOTP, setGeneratedOTP] = useState(""); // For dev mode display

  // Ensure all fields have default values
  const safeFormData = {
    volunteerPrograms: [],
    affirmativeActionSubjects: [],
    volunteerStatus: "",
    tagapagUgnay: "",
    otherOrganization: "",
    organizationName: "",
    howDidYouHear: "",
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

    if (!safeFormData.volunteerPrograms || safeFormData.volunteerPrograms.length === 0) {
      newErrors.volunteerPrograms = "Please select at least one program.";
    }

    if (!safeFormData.volunteerStatus) {
      newErrors.volunteerStatus = "This field is required.";
    }

    if (!safeFormData.tagapagUgnay) {
      newErrors.tagapagUgnay = "This field is required.";
    }

    if (!safeFormData.otherOrganization) {
      newErrors.otherOrganization = "This field is required.";
    }

    if (safeFormData.otherOrganization === "YES" && !safeFormData.organizationName) {
      newErrors.organizationName = "Please provide the organization name.";
    }

    if (safeFormData.volunteerStatus === "First time to apply as volunteer (no engagements yet)" && !safeFormData.howDidYouHear) {
      newErrors.howDidYouHear = "This field is required for first-time volunteers.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [safeFormData]);

  // ----------------- Submit Handlers -----------------
  const handleSubmitClick = () => {
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
      // Send OTP via API
      const response = await sendOTP(formData.email || safeFormData.email);
      
      // In development mode, the API returns the OTP
      if (response.otp) {
        setGeneratedOTP(response.otp);
        console.log("=".repeat(50));
        console.log("🔐 VERIFICATION CODE (OTP):", response.otp);
        console.log("Email:", response.email);
        console.log("=".repeat(50));
      }
      
      setLoading(false);
      setOtpDialog(true);
      setOtp("");
      setOtpError("");
    } catch (error) {
      setLoading(false);
      alert(error.error || "Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      // Call the parent's onSubmit with formData and OTP
      await onSubmit?.(safeFormData, otp);
      setLoading(false);
      setOtpDialog(false);
      setSuccessDialog(true);
    } catch (error) {
      setLoading(false);
      setOtpError(error.error || "OTP verification failed. Please try again.");
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await sendOTP(formData.email || safeFormData.email);
      
      if (response.otp) {
        setGeneratedOTP(response.otp);
        console.log("=".repeat(50));
        console.log("🔐 NEW VERIFICATION CODE (OTP):", response.otp);
        console.log("Email:", response.email);
        console.log("=".repeat(50));
      }
      
      setLoading(false);
      setOtpError("");
      setOtp("");
    } catch (error) {
      setLoading(false);
      alert(error.error || "Failed to resend OTP");
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
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        PROGRAMS YOU WISH TO PARTICIPATE IN
      </Typography>

      {/* Question 44: Volunteer Programs */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ mb: 1, fontWeight: 500 }}>
        VOLUNTEER PROGRAMS *
        </Typography>
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
        {errors.volunteerPrograms && (
          <Typography color="error" variant="body2">
            {errors.volunteerPrograms}
          </Typography>
        )}
      </Box>

      {/* Question 45: Affirmative Action Subjects */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ mb: 1, fontWeight: 500 }}>
          Under the AFFIRMATIVE ACTION PROGRAM, which of the following subjects are you interested in teaching for the academic enhancement sessions?
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

      {/* Question 46: Volunteer Status */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ mb: 1, fontWeight: 500 }}>
          Kindly choose the status of your volunteer application to Ugnayan ng Pahinungod Mindanao. *
        </Typography>
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
          required
        />
      </Box>

      {/* Question 47: Tagapag-Ugnay Group */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ mb: 1, fontWeight: 500 }}>
          Would you like to be part of the TAGAPAG-UGNAY Group? This group of volunteers is dedicated to helping with social media marketing, creating publication materials, and assisting during preparation of activities.
        </Typography>
        <FormSelect
          label="Join Tagapag-Ugnay Group"
          value={safeFormData.tagapagUgnay}
          onChange={(e) => handleChange("tagapagUgnay", e.target.value)}
          options={["YES", "NO"]}
          error={errors.tagapagUgnay}
        />
      </Box>

      {/* Question 48: Other Organization */}
      <Box sx={{ mb: 2 }}>
        <Typography sx={{ mb: 1, fontWeight: 500 }}>
          ARE YOU A PART OF ANY OTHER VOLUNTEER ORGANIZATION? *
        </Typography>
        <FormSelect
          label="Part of Other Organization"
          value={safeFormData.otherOrganization}
          onChange={(e) => handleChange("otherOrganization", e.target.value)}
          options={["YES", "NO"]}
          error={errors.otherOrganization}
          required
        />
      </Box>

      {/* Question 49: Organization Name */}
      {safeFormData.otherOrganization === "YES" && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ mb: 1, fontWeight: 500 }}>
            WHAT IS THE NAME OF THE ORGANIZATION?
          </Typography>
          <FormTextField
            label="Organization Name"
            value={safeFormData.organizationName}
            onChange={(e) => handleChange("organizationName", e.target.value)}
            error={errors.organizationName}
          />
        </Box>
      )}

      {/* Question 50: How Did You Hear (First Time Only) */}
      {isFirstTimeVolunteer && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ mb: 1, fontWeight: 500 }}>
            WHERE DID YOU HEAR ABOUT THE UGNAYAN NG PAHINUNGOD MINDANAO?
          </Typography>
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

      {/* Navigation */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button variant="outlined" onClick={onBack}>
          Back
        </Button>
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
          <Typography>
            Are you sure you want to register as a volunteer? A verification code will be sent to your email.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmSubmit} variant="contained" color="primary">
            Yes, Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* OTP Dialog */}
      <Dialog open={otpDialog} onClose={() => setOtpDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Enter Verification Code</DialogTitle>
        <DialogContent>
          {generatedOTP && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Development Mode: Your OTP is <strong>{generatedOTP}</strong>
              <br />
              (Also check browser console)
            </Alert>
          )}
          <Typography sx={{ mb: 2 }}>
            Please enter the 6-digit verification code:
          </Typography>
          <TextField
            fullWidth
            label="Verification Code"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, ''));
              setOtpError("");
            }}
            placeholder="Enter 6-digit code"
            inputProps={{ maxLength: 6 }}
            error={!!otpError}
            helperText={otpError}
          />
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Button onClick={handleResendOTP} size="small" disabled={loading}>
              {loading ? "Sending..." : "Resend Code"}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOtpDialog(false)}>Cancel</Button>
          <Button onClick={handleVerifyOTP} variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Verify"}
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
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Email:</strong> pahinungod.upmin@up.edu.ph
            </Typography>
            <Typography variant="body2">
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