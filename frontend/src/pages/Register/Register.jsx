// src/pages/Register/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, LinearProgress, Alert, Snackbar } from "@mui/material";
import authAPI from "../../services/volunteerApi";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import "../../styles/Register.css";
import oblation from "../../assets/oblation.png";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    // Email & Consent
    email: "",
    dataConsent: false,

    // Step 1 - Basic Information
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
    
    // Permanent Address
    streetBarangay: "",
    cityMunicipality: "",
    province: "",
    region: "",
    
    // UP Address
    sameAsPermanent: false,
    upStreetBarangay: "",
    upCityMunicipality: "",
    upProvince: "",
    upRegion: "",

    // Step 2 - Affiliation
    affiliation: "",
    
    // Student fields
    degreeProgram: "",
    yearLevel: "",
    college: "",
    shsType: "",
    gradBachelors: "",
    firstCollege: "",
    firstGrad: "",
    firstUP: "",
    
    // Emergency Contact
    emerName: "",
    emerRelation: "",
    emerContact: "",
    emerAddress: "",
    
    // Faculty fields
    facultyDept: "",
    
    // Alumni fields
    constituentUnit: "",
    alumniDegree: "",
    yearGrad: "",
    firstGradCollege: "",
    firstGradUP: "",
    occupation: "",
    
    // Retiree fields
    retireDesignation: "",
    retireOffice: "",
    
    // Staff fields
    staffOffice: "",
    staffPosition: "",

    // Step 3 - Programs
    volunteerPrograms: [],
    affirmativeActionSubjects: [],
    volunteerStatus: "",
    tagapagUgnay: "",
    otherOrganization: "",
    organizationName: "",
    howDidYouHear: "",

    // Step 4 - Password
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (finalData) => {
    setLoading(true);
    setError(null);

    try {
      // Transform form data to match backend API structure
      const registrationData = {
        // Account
        account: {
          email: finalData.email,
          password: finalData.password,
        },
        
        // Basic volunteer info
        volunteer: {
          first_name: finalData.firstName,
          middle_name: finalData.middleName,
          last_name: finalData.lastName,
          nickname: finalData.nickname,
          sex: finalData.sex,
          birthdate: finalData.birthdate 
            ? new Date(finalData.birthdate).toISOString().split('T')[0] 
            : null,
          affiliation_type: finalData.affiliation,
        },
        
        // Contact
        contact: {
          mobile_number: finalData.mobileNumber,
          facebook_link: finalData.facebookLink,
        },
        
        // Address (permanent)
        address: {
          street_address: finalData.streetBarangay,
          province: finalData.province,
          region: finalData.region,
        },
        
        // Background
        background: {
          occupation: finalData.occupation || "",
          org_affiliation: finalData.organizations || "",
          hobbies_interests: finalData.hobbies || "",
        },
      };

      // Add emergency contact for students
      if (finalData.affiliation === "STUDENT") {
        registrationData.emergency_contact = {
          name: finalData.emerName,
          relationship: finalData.emerRelation,
          contact_number: finalData.emerContact,
          address: finalData.emerAddress,
        };
      }

      // Add affiliation-specific data
      if (finalData.affiliation === "STUDENT") {
        registrationData.affiliation_data = {
          degree_program: finalData.degreeProgram,
          year_level: finalData.yearLevel,
          college: finalData.college,
          department: "",
        };
      } else if (finalData.affiliation === "ALUMNI") {
        registrationData.affiliation_data = {
          constituent_unit: finalData.constituentUnit,
          degree_program: finalData.alumniDegree,
          year_graduated: finalData.yearGrad,
        };
      } else if (finalData.affiliation === "UP STAFF") {
        registrationData.affiliation_data = {
          office_department: finalData.staffOffice,
          designation: finalData.staffPosition,
        };
      } else if (finalData.affiliation === "FACULTY") {
        registrationData.affiliation_data = {
          college: finalData.facultyDept.split('-')[0]?.trim() || "",
          department: finalData.facultyDept.split('-')[1]?.trim() || "",
        };
      } else if (finalData.affiliation === "RETIREE") {
        registrationData.affiliation_data = {
          designation_while_in_up: finalData.retireDesignation,
          office_college_department: finalData.retireOffice,
        };
      }

      console.log("Submitting registration:", registrationData);

      // Call the API
      const result = await authAPI.register(registrationData);

      setLoading(false);
      
      if (result.success) {
        return { success: true };
      } else {
        throw new Error(result.error || "Registration failed");
      }
    } catch (err) {
      setLoading(false);
      
      // Handle different types of errors
      let errorMessage = "Registration failed. Please try again.";
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.errors) {
          const errorList = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          errorMessage = errorList;
        } else if (errorData.account?.email) {
          errorMessage = `Email: ${errorData.account.email[0]}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      window.scrollTo({ top: 0, behavior: "smooth" });
      
      return { success: false, error: errorMessage };
    }
  };

  const handleCloseError = () => {
    setError(null);
  };

  const progress = (step / 4) * 100;

  return (
    <div className="register-page">
      <div className="left-side">
        <div className="left-text">
          <h1 className="big">MAKIBAHAGI</h1>
          <h1 className="big1">MAGLINGKOD</h1>

          <div className="mag-pahinungod-row">
            <h1 className="big">MAG</h1>
            <h1 className="pahinungod">PAHINUNGOD</h1>
          </div>

          <div className="oblation-container">
            <img src={oblation} alt="oblation" />
          </div>
        </div>
      </div>

      <div className="right-side">
        <div className="register-container">
          <Box sx={{ width: "100%", maxWidth: "700px", py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4, textAlign: "center" }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#FF7F00", mb: 1 }}>
                Ugnayan ng Pahinungód Mindanao
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Volunteer Sign-up Form
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                (New registration and updating of information)
              </Typography>
              <Typography variant="body2" sx={{ textAlign: "justify", mb: 3 }}>
                As the volunteering arm of the University of the Philippines, Ugnayan ng Pahinungód provides an avenue for students, teachers, staff, alumni, and retirees to render services to partner communities and individuals as our share in the welfare and development of the country.
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert 
                severity="error" 
                onClose={handleCloseError}
                sx={{ mb: 3, whiteSpace: 'pre-line' }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Registration Error
                </Typography>
                {error}
              </Alert>
            )}

            {/* Progress Bar */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Step {step} of 4
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ height: 8, borderRadius: 4 }} 
              />
            </Box>

            {/* Steps */}
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
                onBack={() => setStep(2)}
                onNext={() => setStep(4)}
              />
            )}

            {step === 4 && (
              <Step4
                formData={formData}
                setFormData={setFormData}
                onBack={() => setStep(3)}
                onSubmit={handleSubmit}
                loading={loading}
              />
            )}
          </Box>
        </div>
      </div>

      {/* Loading Snackbar */}
      <Snackbar
        open={loading}
        message="Submitting registration..."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </div>
  );
}
