// ============================================================================
// MAIN REGISTER COMPONENT - src/pages/Register/Register.jsx
// ============================================================================
import React, { useState } from "react";
import { Container, Box, Paper, Typography, LinearProgress } from "@mui/material";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import DefaultPage from "../../layout/default_page.jsx";
import "../../styles/Register.css";

export default function Register() {
  const [step, setStep] = useState(1);
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
  });

  const handleSubmit = async (data, otp) => {
    // TODO: Replace with actual API call
    console.log("Submitting:", data, otp);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // If successful, the Step3 component will show success dialog
    return true;
  };

  const progress = (step / 3) * 100;

  return (
      <div className="register-page">

        <Box sx={{ width: "700px", maxWidth: "100%", py: 4 }} className="register-container">
          <Paper elevation={3} sx={{ p: 4, borderRadius: 0 }}>
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

            {/* Progress Bar */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Step {step} of 3
              </Typography>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
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
                onSubmit={handleSubmit}
              />
            )}
          </Paper>
        </Box>

      </div>
  );
}