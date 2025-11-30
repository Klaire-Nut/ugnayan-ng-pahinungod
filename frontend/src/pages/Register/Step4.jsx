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

export default function Step4({ formData = {}, setFormData, onBack, onSubmit, loading }) {
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [password, setPassword] = useState(formData.password || "");
  const [confirmPassword, setConfirmPassword] = useState(formData.confirmPassword || "");
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [successDialog, setSuccessDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = useCallback((setter) => (e) => {
    setter(e.target.value);
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    }
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

  const handleConfirmSubmit = async () => {
    setConfirmDialog(false);
    setSubmitting(true);
    
    // Update formData with password
    const finalData = { ...formData, password, confirmPassword };
    
    try {
      const result = await onSubmit(finalData);
      
      setSubmitting(false);
      
      if (result && result.success) {
        setSuccessDialog(true);
      } else {
        // Error is handled in parent component
        console.error("Registration failed:", result?.error);
      }
    } catch (error) {
      setSubmitting(false);
      console.error("Registration error:", error);
    }
  };

  const handleSuccessClose = () => {
    setSuccessDialog(false);
    navigate("/login");
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Set Your Password
      </Typography>

      <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
        Create a secure password for your account. Your password must be at least 8 characters long.
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
        <Button variant="outlined" onClick={onBack} disabled={submitting || loading}>
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmitClick}
          sx={{ backgroundColor: "#FF7F00", "&:hover": { backgroundColor: "#e66e00" } }}
          disabled={submitting || loading}
        >
          {submitting || loading ? <CircularProgress size={24} /> : "Submit"}
        </Button>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => !submitting && setConfirmDialog(false)}>
        <DialogTitle>Confirm Submission</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit your registration? Please review all information before confirming.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSubmit}
            variant="contained"
            color="primary"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : "Yes, Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialog} onClose={handleSuccessClose}>
        <DialogContent sx={{ textAlign: "center", py: 4 }}>
          <CheckCircleIcon sx={{ fontSize: 80, color: "#4CAF50", mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: "#4CAF50" }}>
            REGISTRATION SUCCESSFUL!
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            THANK YOU FOR SIGNING UP!
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
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
