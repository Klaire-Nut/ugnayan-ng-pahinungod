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

  // ✅ ADD THESE TWO STATES (required for login modal)
  const [showLogin, setShowLogin] = useState(false);
  const [loginRole, setLoginRole] = useState("");

  
  const onSubmit = async (finalData) => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/volunteers/register/", // your backend endpoint
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

      if (!response.ok) throw data; // catch validation errors

      return data; // Step4 will receive this
    } catch (err) {
      console.error("Registration error:", err);
      throw err; // Step4 will handle the alert
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

    // Permanent address (main)
    streetBarangay: "",
    cityMunicipality: "",
    province: "",
    region: "",

    // UP Address (secondary)
    sameAsPermanent: false,
    upStreetBarangay: "",
    upCityMunicipality: "",
    upProvince: "",
    upRegion: "",

    // Step 2 – Affiliation
    affiliation: "",
    degreeProgram: "",
    yearLevel: "",
    college: "",
    department: "",

    shsType: "",
    gradBachelors: "",
    firstCollege: "",
    firstGrad: "",
    firstUP: "",

    emerName: "",
    emerRelation: "",
    emerContact: "",
    emerAddress: "",

    facultyDept: "",
    constituentUnit: "",
    alumniDegree: "",
    yearGrad: "",
    firstGradCollege: "",
    firstGradUP: "",
    occupation: "",
    retireDesignation: "",
    retireOffice: "",
    staffOffice: "",
    staffPosition: "",

    // Step 3 – Programs
    volunteerPrograms: [],
    affirmativeActionSubjects: [],
    volunteerStatus: "",
    tagapagUgnay: "",
    otherOrganization: "",
    organizationName: "",
    howDidYouHear: "",
  });

  // -----------------------------------------
  // SUBMIT HANDLER (FINAL STEP 4)
  // -----------------------------------------
  const handleSubmit = async (finalData) => {
    setLoading(true);
    setError(null);

    // -----------------------------------------
    // BUILD PAYLOAD EXACTLY HOW BACKEND EXPECTS
    // -----------------------------------------
    const registrationData = {
      account: {
        email: finalData.email,
        password: finalData.password,
      },

      volunteer: {
        first_name: finalData.firstName,
        middle_name: finalData.middleName,
        last_name: finalData.lastName,
        nickname: finalData.nickname,
        sex: finalData.sex,
        birthdate: finalData.birthdate
          ? new Date(finalData.birthdate).toISOString().split("T")[0]
          : null,
        affiliation_type: finalData.affiliation_type.toUpperCase(),
      },

      contact: {
        mobile_number: finalData.mobileNumber,
        facebook_link: finalData.facebookLink,
      },

      address: {
        street_address: finalData.streetBarangay,
        province: finalData.province,
        region: finalData.region,
      },

      background: {
        occupation: finalData.occupation,
        org_affiliation: finalData.organizations,
        hobbies_interests: finalData.hobbies,
      },
    };

    // Emergency Contact (students only)
    if (finalData.affiliation === "STUDENT") {
      registrationData.emergency_contact = {
        name: finalData.emerName,
        relationship: finalData.emerRelation,
        contact_number: finalData.emerContact,
        address: finalData.emerAddress,
      };
    }

    // -----------------------------------------
    // AFFILIATION DATA (PROFILE TABLES)
    // -----------------------------------------
    if (finalData.affiliation === "STUDENT") {
      registrationData.affiliation_data = {
        degree_program: finalData.degreeProgram,
        year_level: finalData.yearLevel,
        college: finalData.college,
        department: finalData.department || "",
      };
    }

    if (finalData.affiliation === "ALUMNI") {
      registrationData.affiliation_data = {
        constituent_unit: finalData.constituentUnit,
        degree_program: finalData.alumniDegree,
        year_graduated: finalData.yearGrad,
      };
    }

    if (finalData.affiliation === "UP STAFF") {
      registrationData.affiliation_data = {
        office_department: finalData.staffOffice,
        designation: finalData.staffPosition,
      };
    }

    if (finalData.affiliation === "FACULTY") {
      registrationData.affiliation_data = {
        college: finalData.facultyDept,
        department: finalData.staffPosition,
      };
    }

    if (finalData.affiliation === "RETIREE") {
      registrationData.affiliation_data = {
        designation_while_in_up: finalData.retireDesignation,
        office_college_department: finalData.retireOffice,
      };
    }

    // -----------------------------------------
    // SEND DATA TO BACKEND
    // -----------------------------------------
    try {
      const result = await volunteerAPI.register(registrationData);
      setLoading(false);

      // ❌ OLD BEHAVIOR (breaks Step4 success dialog)
      // navigate("/login");

      // -----------------------------------------
      // 🔧 FIX: DO NOT REDIRECT HERE
      // Let Step4 show success dialog and handle redirect
      // -----------------------------------------
      if (result.success) {
        return { success: true }; // ← FIXED
      } else {
        throw new Error(result.error || "Registration failed");
      }
    } catch (err) {
      setLoading(false);

      let errorMessage = "Registration failed. Please try again.";

      if (err.response?.data) {
        const data = err.response.data;

        if (data.error) errorMessage = data.error;
        else if (data.errors) {
          errorMessage = Object.entries(data.errors)
            .map(
              ([field, msg]) =>
                `${field}: ${
                  Array.isArray(msg) ? msg.join(", ") : msg
                }`
            )
            .join("\n");
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      window.scrollTo({ top: 0, behavior: "smooth" });

      return { success: false, error: errorMessage };
    }
  };

  // -----------------------------------------
  // UI
  // -----------------------------------------
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
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: "#FF7F00" }}
              >
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

            {/* Step Pages */}
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
                loading={loading}
                onSubmit={onSubmit}
                onBack={() => setStep(3)}
              />
            )}
          </Box>
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={loading}
        message="Submitting registration..."
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </div>
  );
}
