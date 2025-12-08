// src/pages/Register/Step2.jsx
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
} from "@mui/material";

// ----------------- Reusable Components (Outside main component) -----------------
const FormTextField = memo(({ label, field, value, onChange, error, multiline = false, rows = 1 }) => (
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

const FormSelect = memo(({ label, value, onChange, options = [], error }) => (
  <FormControl fullWidth sx={{ mb: 2 }} error={!!error}>
    <InputLabel>{label}</InputLabel>
    <Select value={value} label={label} onChange={onChange}>
      {options.map((opt) => {
        const optValue = typeof opt === "object" ? opt.value : opt;
        const optLabel = typeof opt === "object" ? opt.label : opt;
        return (
          <MenuItem key={optValue} value={optValue}>
            {optLabel}
          </MenuItem>
        );
      })}
    </Select>
    {error && (
      <Typography color="error" variant="body2">
        {error}
      </Typography>
    )}
  </FormControl>
));
FormSelect.displayName = "FormSelect";

// ----------------- Main Component -----------------
export default function Step2({ formData = {}, setFormData, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const safeFormData = {
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
    ...formData, 
  };

  // Stable Change Handler 
  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, [setFormData]);

  // Validation 
const validate = useCallback(() => {
    const newErrors = {};

    if (!safeFormData.affiliation) newErrors.affiliation = "This field is required.";

    switch (safeFormData.affiliation) {
      case "STUDENT":
          if (!safeFormData.degreeProgram) newErrors.degreeProgram = "Required.";
          if (!safeFormData.yearLevel) newErrors.yearLevel = "Required.";
          if (!safeFormData.college) newErrors.college = "Required.";
          if (!safeFormData.shsType) newErrors.shsType = "Required.";
          if (!safeFormData.firstUP) newErrors.firstUP = "Required.";
          if (!safeFormData.emerName) newErrors.emerName = "Required.";
          if (!safeFormData.emerRelation) newErrors.emerRelation = "Required.";
          if (!safeFormData.emerContact) newErrors.emerContact = "Required.";
          if (!safeFormData.emerAddress) newErrors.emerAddress = "Required.";
          break;

      case "FACULTY":
          if (!safeFormData.facultyDept) newErrors.facultyDept = "Required.";
          break;

      case "ALUMNI":
          if (!safeFormData.constituentUnit) newErrors.constituentUnit = "Required.";
          if (!safeFormData.alumniDegree) newErrors.alumniDegree = "Required.";
          if (!safeFormData.yearGrad) newErrors.yearGrad = "Required.";
          if (!safeFormData.firstGradCollege) newErrors.firstGradCollege = "Required.";
          if (!safeFormData.firstGradUP) newErrors.firstGradUP = "Required.";
        break;

      case "RETIREE":
          if (!safeFormData.retireDesignation) newErrors.retireDesignation = "Required.";
          if (!safeFormData.retireOffice) newErrors.retireOffice = "Required.";
        break;
      case "UP STAFF":
          if (!safeFormData.staffOffice) newErrors.staffOffice = "Required.";
          if (!safeFormData.staffPosition) newErrors.staffPosition = "Required.";
        break;
        
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [safeFormData]);

  const handleNextClick = () => {
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    onNext?.();
  };

  // ----------------- Render -----------------
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        AFFILIATION TO UP
      </Typography>

      <FormSelect
        label="In what way are you affiliated to UP? *"
        value={safeFormData.affiliation}
        onChange={(e) => handleChange("affiliation", e.target.value)}
        options={[
          { label: "STUDENT", value: "STUDENT" },
          { label: "ALUMNI", value: "ALUMNI" },
          { label: "UP STAFF", value: "UP STAFF" },
          { label: "FACULTY", value: "FACULTY" },
          { label: "RETIREE", value: "RETIREE" },
        ]}
        error={errors.affiliation}
      />

      {/* STUDENT FIELDS */}
      {safeFormData.affiliation === "STUDENT" && (
        <Box sx={{ mb: 2 }}>
          <Typography fontWeight={600} sx={{ mb: 1 }}>
            Student Information
          </Typography>
          <FormSelect
            label="Degree Program *"
            value={safeFormData.degreeProgram}
            onChange={(e) => handleChange("degreeProgram", e.target.value)}
            options={[
              "BS ARCHITECTURE",
              "BA ENGLISH (CREATIVE WRITING)",
              "BS ANTHROPOLOGY",
              "BA COMMUNICATION AND MEDIA ARTS",
              "AA SPORTS STUDIES",
              "B SPORTS SCIENCE",
              "BS AGRIBUSINESS ECONOMICS",
              "BS DATA SCIENCE",
              "BS COMPUTER SCIENCE",
              "BS APPLIED MATHEMATICS",
              "BS FOOD TECHNOLOGY",
              "BS BIOLOGY",
              "MASTER IN URBAN AND REGIONAL PLANNING",
              "DIPLOMA IN URBAN AND REGIONAL PLANNING",
              "MS BIOLOGY",
              "MS FOOD SCIENCE",
              "DIPLOMA IN EXERCISE AND SPORTS SCIENCE",
              "MS HUMAN MOVEMENT SCIENCE",
              "MASTER IN MANAGEMENT",
            ]}
            error={errors.degreeProgram}
          />
          <FormSelect
            label="Year Level *"
            value={safeFormData.yearLevel}
            onChange={(e) => handleChange("yearLevel", e.target.value)}
            options={["FIRST YEAR", "SECOND YEAR", "THIRD YEAR", "FOURTH YEAR", "FIFTH YEAR", "RESIDENCY"]}
            error={errors.yearLevel}
          />
          <FormSelect
            label="College *"
            value={safeFormData.college}
            onChange={(e) => handleChange("college", e.target.value)}
            options={["SOM", "CHSS", "CSM"]}
            error={errors.college}
          />
          <FormSelect
            label="Where did you finish Senior High School? *"
            value={safeFormData.shsType}
            onChange={(e) => handleChange("shsType", e.target.value)}
            options={[
              "PUBLIC GENERAL HIGH SCHOOL",
              "REGIONAL SCIENCE HIGH SCHOOL",
              "DOST PHILIPPINE SCIENCE HIGH SCHOOL",
              "PRIVATE INSTITUTION",
            ]}
            error={errors.shsType}
          />
          <FormTextField
            label="Where did you obtain your bachelor's degree & program? (for graduate students)"
            field="gradBachelors"
            value={safeFormData.gradBachelors}
            onChange={(e) => handleChange("gradBachelors", e.target.value)}
            error={errors.gradBachelors}
          />
          <FormSelect
            label="Are you the first in your family to enter college?"
            value={safeFormData.firstCollege}
            onChange={(e) => handleChange("firstCollege", e.target.value)}
            options={["YES", "NO"]}
            error={errors.firstCollege}
          />
          <FormSelect
            label="Are you the first in your family to pursue graduate studies?"
            value={safeFormData.firstGrad}
            onChange={(e) => handleChange("firstGrad", e.target.value)}
            options={["YES", "NO"]}
            error={errors.firstGrad}
          />
          <FormSelect
            label="Are you the first in your family to enter UP? *"
            value={safeFormData.firstUP}
            onChange={(e) => handleChange("firstUP", e.target.value)}
            options={["YES", "NO"]}
            error={errors.firstUP}
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              Person to Contact in Case of Emergency
            </Typography>
            <FormTextField
              label="Name *"
              field="emerName"
              value={safeFormData.emerName}
              onChange={(e) => handleChange("emerName", e.target.value)}
              error={errors.emerName}
            />
            <FormTextField
              label="Relationship *"
              field="emerRelation"
              value={safeFormData.emerRelation}
              onChange={(e) => handleChange("emerRelation", e.target.value)}
              error={errors.emerRelation}
            />
            <FormTextField
              label="Contact Number *"
              field="emerContact"
              value={safeFormData.emerContact}
              onChange={(e) => handleChange("emerContact", e.target.value)}
              error={errors.emerContact}
            />
            <FormTextField
              label="Address *"
              field="emerAddress"
              value={safeFormData.emerAddress}
              onChange={(e) => handleChange("emerAddress", e.target.value)}
              error={errors.emerAddress}
              multiline
              rows={2}
            />
          </Box>
        </Box>
      )}

      {/* FACULTY */}
      {safeFormData.affiliation === "FACULTY" && (
        <Box sx={{ mb: 2 }}>
          <Typography fontWeight={600} sx={{ mb: 1 }}>
            Faculty Details
          </Typography>
          <FormTextField
            label="College and Department *"
            field="facultyDept"
            value={safeFormData.facultyDept}
            onChange={(e) => handleChange("facultyDept", e.target.value)}
            error={errors.facultyDept}
          />
        </Box>
      )}

      {/* ALUMNI */}
      {safeFormData.affiliation === "ALUMNI" && (
        <Box sx={{ mb: 2 }}>
          <Typography fontWeight={600} sx={{ mb: 1 }}>
            Alumni Details
          </Typography>
          <FormSelect
            label="UP Constituent Unit *"
            value={safeFormData.constituentUnit}
            onChange={(e) => handleChange("constituentUnit", e.target.value)}
            options={[
              "UP BAGUIO",
              "UP LOS BANOS",
              "UP OPEN UNIVERSITY",
              "UP DILIMAN",
              "UP MANILA",
              "UP VISAYAS",
              "UP TACLOBAN",
              "UP CEBU",
              "UP MINDANAO",
            ]}
            error={errors.constituentUnit}
          />
          <FormTextField
            label="Degree Program *"
            field="alumniDegree"
            value={safeFormData.alumniDegree}
            onChange={(e) => handleChange("alumniDegree", e.target.value)}
            error={errors.alumniDegree}
          />
          <FormTextField
            label="Year Graduated *"
            field="yearGrad"
            value={safeFormData.yearGrad}
            onChange={(e) => handleChange("yearGrad", e.target.value)}
            error={errors.yearGrad}
          />
          <FormSelect
            label="Are you the first in your family to graduate college? *"
            value={safeFormData.firstGradCollege}
            onChange={(e) => handleChange("firstGradCollege", e.target.value)}
            options={["YES", "NO"]}
            error={errors.firstGradCollege}
          />
          <FormSelect
            label="Are you the first in your family to graduate from UP? *"
            value={safeFormData.firstGradUP}
            onChange={(e) => handleChange("firstGradUP", e.target.value)}
            options={["YES", "NO"]}
            error={errors.firstGradUP}
          />
          <FormTextField
            label="Current Occupation"
            field="occupation"
            value={safeFormData.occupation}
            onChange={(e) => handleChange("occupation", e.target.value)}
            error={errors.occupation}
          />
        </Box>
      )}

      {/* RETIREE */}
      {safeFormData.affiliation === "RETIREE" && (
        <Box sx={{ mb: 2 }}>
          <Typography fontWeight={600} sx={{ mb: 1 }}>
            Retiree Details
          </Typography>
          <FormTextField
            label="Designation while in UP *"
            field="retireDesignation"
            value={safeFormData.retireDesignation}
            onChange={(e) => handleChange("retireDesignation", e.target.value)}
            error={errors.retireDesignation}
          />
          <FormTextField
            label="College / Department / Office while in UP *"
            field="retireOffice"
            value={safeFormData.retireOffice}
            onChange={(e) => handleChange("retireOffice", e.target.value)}
            error={errors.retireOffice}
          />
        </Box>
      )}

      {/* UP STAFF */}
      {safeFormData.affiliation === "UP STAFF" && (
        <Box sx={{ mb: 2 }}>
          <Typography fontWeight={600} sx={{ mb: 1 }}>
            UP REPS / Admin Staff / NGS Details
          </Typography>
          <FormTextField
            label="Office / Department *"
            field="staffOffice"
            value={safeFormData.staffOffice}
            onChange={(e) => handleChange("staffOffice", e.target.value)}
            error={errors.staffOffice}
          />
          <FormTextField
            label="Designation / Position *"
            field="staffPosition"
            value={safeFormData.staffPosition}
            onChange={(e) => handleChange("staffPosition", e.target.value)}
            error={errors.staffPosition}
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
          onClick={handleNextClick}
          sx={{ backgroundColor: "#FF7F00", "&:hover": { backgroundColor: "#e66e00" } }}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}