// ============================================================================
// MAIN REGISTER COMPONENT - src/pages/Register/Register.jsx
// ============================================================================
import React, { useState } from "react";
import { Box, Paper, Typography, LinearProgress } from "@mui/material";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import Step4 from "./Step4";
import "../../styles/Register.css";
import oblation from "../../assets/oblation.png";

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
    console.log("Submitting:", data, otp);

    await new Promise(resolve => setTimeout(resolve, 1500));

    return true;
  };

  const progress = (step / 4) * 100;

  return (
  <div className="register-page">
    <div className="left-side">
      <div className="left-text">
        <h1 className="big">MAKIBAHAGI</h1>
        <h1 className="big1">MAGLINGKOD</h1>

        {/* MAG and PAHINUNGOD side by side */}
        <div className="mag-pahinungod-row">
          <h1 className="big">MAG</h1>
          <h1 className="pahinungod">PAHINUNGOD</h1>
        </div>

        <div className="oblation-container">
          <img src={oblation} alt="oblation" />
        </div>
      </div>
    </div>

      {/* RIGHT SIDE — SCROLLABLE */}
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

              {/* Progress Bar */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Step {step} of 4
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
                  onNext={() => setStep(4)}
                />
              )}

              {step === 4 && (
                <Step4
                  formData={formData}
                  setFormData={setFormData}
                  onBack={() => setStep(3)}
                  onSubmit={handleSubmit}
                />
              )}

          </Box>

        </div>
      </div>

    </div>
  );
}
