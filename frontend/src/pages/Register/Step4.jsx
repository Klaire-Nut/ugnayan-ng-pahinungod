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

export default function Step4({ formData = {}, setFormData, onBack, onSubmit }) {
  const [errors, setErrors] = useState({});
  const [password, setPassword] = useState(formData.password || "");
  const [confirmPassword, setConfirmPassword] = useState(formData.confirmPassword || "");
  const [confirmDialog, setConfirmDialog] = useState(false);
  //const [otpDialog, setOtpDialog] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  //const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // ----------------- Handlers -----------------
  const handleChange = useCallback((setter) => (e) => {
    setter(e.target.value);
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!password) newErrors.password = "Password is required.";
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password.";
    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }
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

// FINAL SUBMISSION (NO OTP)
const handleConfirmSubmit = async () => {
  setConfirmDialog(false);
  setLoading(true);

  // ---------------- Serialize the data ----------------
  const prepareFinalData = (formData, password) => {
  // ---------------- Validate and format birthdate ----------------
  let birthdate = "";
  if (formData.birthdate) {
    const birthDateObj = new Date(formData.birthdate);

    if (birthDateObj > new Date()) {
      // Prevent future dates
      alert("Birthdate cannot be in the future.");
      setLoading(false);
      throw new Error("Invalid birthdate");
    }

    birthdate = birthDateObj.toISOString().split("T")[0];
  }

  const emptyIfNull = (val) => val || ""; // helper to force empty string

  return {
    first_name: emptyIfNull(formData.firstName),
    middle_name: emptyIfNull(formData.middleName),
    last_name: emptyIfNull(formData.lastName),
    nickname: emptyIfNull(formData.nickname),
    sex: emptyIfNull(formData.sex),
    birthdate: birthdate,
    affiliation_type: emptyIfNull(formData.affiliation?.toLowerCase()),

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

    account: {
      email: emptyIfNull(formData.email),
      password: emptyIfNull(password),
    },

    program_interests: formData.volunteerPrograms || [],
    affirmative_action_subjects: formData.affirmativeActionSubjects || [],
    volunteer_status: emptyIfNull(formData.volunteerStatus),

    // Affiliation-specific profiles
    student_profile:
      formData.affiliation?.toLowerCase() === "student"
        ? {
            degree_program: emptyIfNull(formData.degreeProgram),
            year_level: emptyIfNull(formData.yearLevel),
            college: emptyIfNull(formData.college),
            department: emptyIfNull(formData.department),
          }
        : {},

    alumni_profile:
      formData.affiliation?.toLowerCase() === "alumni"
        ? {
            constituent_unit: emptyIfNull(formData.constituentUnit),
            degree_program: emptyIfNull(formData.degreeProgram),
            year_graduated: emptyIfNull(formData.yearGraduated),
          }
        : {},

    staff_profile:
      formData.affiliation?.toLowerCase() === "staff"
        ? {
            office_department: emptyIfNull(formData.officeDepartment),
            designation: emptyIfNull(formData.designation),
          }
        : {},

    faculty_profile:
      formData.affiliation?.toLowerCase() === "faculty"
        ? {
            college: emptyIfNull(formData.facultyCollege),
            department: emptyIfNull(formData.facultyDepartment),
          }
        : {},

    retiree_profile:
      formData.affiliation?.toLowerCase() === "retiree"
        ? {
            designation_while_in_up: emptyIfNull(formData.oldDesignation),
            office_college_department: emptyIfNull(formData.oldCollegeDept),
          }
        : {},
  };
};

  try {
    const finalData = prepareFinalData(formData, password);
    console.log("Submitting finalData:", finalData);

    await onSubmit(finalData);
    setLoading(false);
    setSuccessDialog(true);
  } catch (error) {
    // Stop already handled birthdate errors
    if (error.message === "Invalid birthdate") return;

    setLoading(false);
    console.error("Registration failed:", error);
    const message =
      error.error ||
      (error.errors ? JSON.stringify(error.errors) : null) ||
      error._general ||
      "Registration failed. Please check your input.";

    alert(message);
  }
};

const handleSuccessClose = () => {
  setSuccessDialog(false);
  window.location.href = "/";
};

  /* ---------------------------------------------------------
     OTP PROCESS (COMMENTED OUT, FOR FUTURE IMPLEMENTATION)
  const handleConfirmSubmit = async () => {
    setConfirmDialog(false);
    setLoading(true);
    // Update formData with password
    setFormData((prev) => ({ ...prev, password }));

    try {
      // Simulate sending OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLoading(false);
      setOtpDialog(true);
    } catch (error) {
      setLoading(false);
      alert("Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 4) {
      alert("Please enter a valid OTP");
      return;
    }

    setLoading(true);
    try {
      // Call parent's onSubmit with formData and OTP
      await onSubmit?.({ ...formData, password }, otp);
      setLoading(false);
      setOtpDialog(false);
      setSuccessDialog(true);
    } catch (error) {
      setLoading(false);
      alert("OTP verification failed. Please try again.");
    }
  };

  const handleSuccessClose = () => {
    setSuccessDialog(false);
    // Optionally redirect after success
    window.location.href = "/";
  };*/

  // ----------------- Render -----------------
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Set Your Password
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
          sx={{ backgroundColor: "#FF7F00", "&:hover": { backgroundColor: "#e66e00" } }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Submit"}
        </Button>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirm Submission</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit your registration?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmSubmit} variant="contained" color="primary">
            Yes, Submit
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

      {/* Confirmation Dialog 
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirm Submission</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit your registration? An OTP will be sent to your email for verification.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmSubmit} variant="contained" color="primary">
            Yes, Continue
          </Button>
        </DialogActions>
      </Dialog>*/}

      {/* OTP Dialog 
      <Dialog open={otpDialog} onClose={() => setOtpDialog(false)}>
        <DialogTitle>Enter OTP</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            We've sent a verification code to your email. Please enter it below:
          </Typography>
          <TextField
            fullWidth
            label="OTP Code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit code"
            inputProps={{ maxLength: 6 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOtpDialog(false)}>Cancel</Button>
          <Button onClick={handleVerifyOTP} variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Verify"}
          </Button>
        </DialogActions>
      </Dialog> 

      {/* Success Dialog 
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
      </Dialog> */}
    </Box>
  );
}
