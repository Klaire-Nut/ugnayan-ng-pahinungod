// MERGED REGISTER COMPONENT - UI + BACKEND
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, LinearProgress, Alert, Snackbar } from "@mui/material";
import { volunteerAPI } from "../../services/volunteerApi";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import LoginPopup from "../../components/LoginPopup";   
import "../../styles/Register.css";
import oblation from "../../assets/oblation.png";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ⭐ REQUIRED FOR AUTO-LOGIN POPUP AFTER REGISTRATION
  const [showLogin, setShowLogin] = useState(false);
  const [loginRole, setLoginRole] = useState("");

  const handleOpenLogin = (role) => {
    setLoginRole(role);
    setShowLogin(true);
  };

  // API SUBMIT FUNCTION PASSED TO STEP4
  const onSubmit = async (finalData) => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/volunteers/register/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(finalData),
        }
      );

      const data = await response.json();
      console.log("API Response:", data);

      if (!response.ok) throw data;

      return data;
    } catch (err) {
      console.error("Registration error:", err);
      throw err;
    }
  };

  const [formData, setFormData] = useState({
    // Step 1 – Basic
    email: "",
    password: "",
    confirmPassword: "",
    dataConsent: false,

    lastName: "",
    firstName: "",
    middleName: "",
    nickname: "",
    age: "",
    sex: "",
    birthdate: null,
    indigenousAffiliation: "",
    mobileNumber: "",
    facebookLink: "",
    hobbies: "",
    organizations: "",

    streetBarangay: "",
    cityMunicipality: "",
    province: "",
    region: "",

    // Step 2
    affiliation: "",
    degreeProgram: "",
    yearLevel: "",
    college: "",
    department: "",

    emerName: "",
    emerRelation: "",
    emerContact: "",
    emerAddress: "",

    occupation: "",
    // … other step form fields …
  });

  const progress = (step / 4) * 100;

  return (
    <div className="register-page">
      {/* LEFT SIDE */}
      <div className="left-side">
        <div className="left-text">
          <h1 className="big">MAKIBAHAGI</h1>
          <h1 className="big1">MAGLINGKOD</h1>

          <div className="mag-pahinungod-row">
            <h1 className="big">MAG</h1>
            <h1 className="pahinungod">PAHINUNGÓD</h1>
          </div>

          <div className="oblation-container">
            <img src={oblation} alt="oblation" />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="right-side">
        <div className="register-container">
          <Box sx={{ width: "100%", maxWidth: "700px", py: 4 }}>
            <Box sx={{ mb: 4, textAlign: "center" }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#FF7F00" }}>
                Ugnayan ng Pahinungód Mindanao
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Volunteer Sign-up Form
              </Typography>
              <Typography variant="body2" color="text.secondary">
                (New registration and updating of information)
              </Typography>
            </Box>

            {/* Error Box */}
            {error && (
              <Alert severity="error" sx={{ mb: 3, whiteSpace: "pre-line" }}>
                {error}
              </Alert>
            )}

            {/* Progress Bar */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2">Step {step} of 4</Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            {/* STEP PAGES */}
            {step === 1 && (
              <Step1
                formData={formData}
                setFormData={setFormData}
                onNext={() => setStep(2)}
              />
            )}

            {step === 2 && (
              <Step2
                formData={formData}
                setFormData={setFormData}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}

            {step === 3 && (
              <Step3
                formData={formData}
                setFormData={setFormData}
                onNext={() => setStep(4)}
                onBack={() => setStep(2)}
              />
            )}

            {step === 4 && (
              <Step4
                formData={formData}
                setFormData={setFormData}
                onSubmit={onSubmit}
                onBack={() => setStep(3)}

                // ⭐⭐⭐ THIS FIXES THE ERROR ⭐⭐⭐
                onOpenLogin={handleOpenLogin}
              />
            )}
          </Box>
        </div>
      </div>

      {/* LOGIN POPUP AFTER SUCCESSFUL REGISTRATION */}
      <LoginPopup
        open={showLogin}
        role={loginRole}
        onClose={() => setShowLogin(false)}
      />

      {/* Snackbar */}
      <Snackbar
        open={loading}
        message="Submitting registration..."
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </div>
  );
}