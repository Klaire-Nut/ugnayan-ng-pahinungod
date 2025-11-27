// MERGED REGISTER COMPONENT - UI + BACKEND
import React, { useState } from "react";
import { Box, Paper, Typography, LinearProgress } from "@mui/material";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Step3 from "./Step3";
import DefaultPage from "../../layout/default_page.jsx";
import { registerVolunteer } from "../../services/volunteerApi.js";
import "../../styles/Register.css";
import oblation from "../../assets/oblation.png";

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
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
    sameAsPermanent: false,
    upStreetBarangay: "",
    upCityMunicipality: "",
    upProvince: "",
    upRegion: "",
    affiliation: "",
    degreeProgram: "",
    yearLevel: "",
    college: "",
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
    volunteerPrograms: [],
    affirmativeActionSubjects: [],
    volunteerStatus: "",
    tagapagUgnay: "",
    otherOrganization: "",
    organizationName: "",
    howDidYouHear: "",
  });

  const handleSubmit = async (data) => {
    try {
      console.log("Submitting registration...");
      const response = await registerVolunteer(data);
      console.log("Registration successful:", response);
      alert("Registration successful!");
      setStep(1);
    } catch (error) {
      console.error("Registration failed:", error);
      if (error.error) {
        alert(error.error);
      } else if (typeof error === "object") {
        const errorMessages = Object.entries(error)
          .map(
            ([field, messages]) =>
              `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`
          )
          .join("\n");
        alert(`Registration failed:\n${errorMessages}`);
      } else {
        alert("Registration failed. Please try again.");
      }
    }
  };

  const progress = (step / 4) * 100;

  return (
    <DefaultPage>
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

              {/*KEEP THIS FROM VERSION 1 */}
              <Typography variant="body2" sx={{ textAlign: "justify", mb: 3 }}>
                As the volunteering arm of the University of the Philippines, Ugnayan ng Pahinungód
                provides an avenue for students, teachers, staff, alumni, and retirees to render
                services to partner communities and individuals as our share in the welfare and
                development of the country.
              </Typography>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Step {step} of 3
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            {/* Steps */}
            {step === 1 && (
              <Step1 formData={formData} setFormData={setFormData} onNext={() => setStep(2)} />
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
    </DefaultPage>
  );
}
