// STEP 1 COMPONENT - src/pages/Register/Step1.jsx

import React, { useState, memo, useCallback } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const FormTextField = memo(({ label, value, onChange, error, required = false, multiline = false, rows = 1 }) => (
  <TextField
    fullWidth
    label={label}
    value={value}
    onChange={onChange}
    error={!!error}
    helperText={error}
    required={required}
    multiline={multiline}
    minRows={multiline ? rows : undefined}
    sx={{ mb: 2 }}
  />
));
FormTextField.displayName = "FormTextField";

const FormSelect = memo(({ label, value, onChange, options = [], error, required = false }) => (
  <FormControl fullWidth sx={{ mb: 2 }} error={!!error} required={required}>
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

export default function Step1({ formData = {}, setFormData, onNext }) {
  const [errors, setErrors] = useState({});

  const safeFormData = {
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
    ...formData,
  };

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, [setFormData]);

  const validate = useCallback(() => {
    const newErrors = {};

    if (!safeFormData.email) newErrors.email = "Required.";
    if (!safeFormData.dataConsent) newErrors.dataConsent = "You must consent to continue.";
    if (!safeFormData.lastName) newErrors.lastName = "Required.";
    if (!safeFormData.firstName) newErrors.firstName = "Required.";
    if (!safeFormData.middleName) newErrors.middleName = "Required.";
    if (!safeFormData.nickname) newErrors.nickname = "Required.";
    if (!safeFormData.age) newErrors.age = "Required.";
    if (!safeFormData.sex) newErrors.sex = "Required.";
    if (!safeFormData.birthdate) newErrors.birthdate = "Required.";
    if (!safeFormData.mobileNumber) newErrors.mobileNumber = "Required.";
    if (!safeFormData.facebookLink) newErrors.facebookLink = "Required.";
    if (!safeFormData.hobbies) newErrors.hobbies = "Required.";
    if (!safeFormData.organizations) newErrors.organizations = "Required.";
    if (!safeFormData.streetBarangay) newErrors.streetBarangay = "Required.";
    if (!safeFormData.cityMunicipality) newErrors.cityMunicipality = "Required.";
    if (!safeFormData.province) newErrors.province = "Required.";
    if (!safeFormData.region) newErrors.region = "Required.";

    if (!safeFormData.sameAsPermanent) {
      if (!safeFormData.upStreetBarangay) newErrors.upStreetBarangay = "Required.";
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

  const regions = [
    "National Capital Region (NCR)",
    "Cordillera Administrative Region (CAR)",
    "Ilocos Region (Region I)",
    "Cagayan Valley (Region II)",
    "Central Luzon (Region III)",
    "Calabarzon (Region IV-A/Southern Tagalog Mainland)",
    "Mimaropa (Region IV-B/Southwestern Tagalog Region)",
    "Bicol Region (Region V)",
    "Western Visayas (Region VI)",
    "Central Visayas (Region VII)",
    "Eastern Visayas (Region VIII)",
    "Zamboanga Peninsula (Region IX)",
    "Northern Mindanao (Region X)",
    "Davao Region (Region XI)",
    "Soccsksargen (Region XII)",
    "Caraga Region (Region XIII)",
    "Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)",
  ];

  return (
    <Box>
      {/* Email & Consent */}
      <FormTextField
        label="Email"
        value={safeFormData.email}
        onChange={(e) => handleChange("email", e.target.value)}
        error={errors.email}
        required
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={safeFormData.dataConsent}
            onChange={(e) => handleChange("dataConsent", e.target.checked)}
          />
        }
        label="I hereby allow the Ugnayan ng Pahinungód Mindanao to store, and collect my data for the purposes of coordination for the volunteer efforts, and to share my data with partner offices and organizations, only if necessary. *"
        sx={{ mb: 2 }}
      />
      {errors.dataConsent && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {errors.dataConsent}
        </Typography>
      )}

      <Typography variant="h6" sx={{ mb: 2, mt: 3, fontWeight: 600 }}>
        BASIC INFORMATION
      </Typography>

      <Typography variant="body2" sx={{ mb: 2 }}>
        Kindly fill out this registration form for our file. Data gathered will be used for directory purposes and certificate generation use only. Rest assured that we will not be giving out your personal information to other parties without your prior approval.
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2, mb: 2 }}>
        <FormTextField
          label="Last Name"
          value={safeFormData.lastName}
          onChange={(e) => handleChange("lastName", e.target.value)}
          error={errors.lastName}
          required
        />
        <FormTextField
          label="First Name"
          value={safeFormData.firstName}
          onChange={(e) => handleChange("firstName", e.target.value)}
          error={errors.firstName}
          required
        />
        <FormTextField
          label="Middle Name"
          value={safeFormData.middleName}
          onChange={(e) => handleChange("middleName", e.target.value)}
          error={errors.middleName}
          required
        />
      </Box>

      <FormTextField
        label="Nickname"
        value={safeFormData.nickname}
        onChange={(e) => handleChange("nickname", e.target.value)}
        error={errors.nickname}
        required
      />

      <FormSelect
        label="Age"
        value={safeFormData.age}
        onChange={(e) => handleChange("age", e.target.value)}
        options={["18-25 years old", "26-35 years old", "36-45 years old", "45-55 years old", "56 above years old"]}
        error={errors.age}
        required
      />

      <FormSelect
        label="Sex Assigned at Birth"
        value={safeFormData.sex}
        onChange={(e) => handleChange("sex", e.target.value)}
        options={["Male", "Female", "Prefer not to say"]}
        error={errors.sex}
        required
      />

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Birthdate *"
          value={safeFormData.birthdate}
          onChange={(date) => handleChange("birthdate", date)}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              error={!!errors.birthdate}
              helperText={errors.birthdate}
              sx={{ mb: 2 }}
            />
          )}
          slotProps={{
            textField: {
              fullWidth: true,
              error: !!errors.birthdate,
              helperText: errors.birthdate,
              sx: { mb: 2 }
            }
          }}
        />
      </LocalizationProvider>

      <FormTextField
        label="Indigenous Peoples'/Ethnolinguistic Affiliation"
        value={safeFormData.indigenousAffiliation}
        onChange={(e) => handleChange("indigenousAffiliation", e.target.value)}
        error={errors.indigenousAffiliation}
      />

      <FormTextField
        label="Mobile Number"
        value={safeFormData.mobileNumber}
        onChange={(e) => handleChange("mobileNumber", e.target.value)}
        error={errors.mobileNumber}
        required
      />

      <FormTextField
        label="Facebook Link"
        value={safeFormData.facebookLink}
        onChange={(e) => handleChange("facebookLink", e.target.value)}
        error={errors.facebookLink}
        required
      />

      <FormTextField
        label="Hobbies/Interests"
        value={safeFormData.hobbies}
        onChange={(e) => handleChange("hobbies", e.target.value)}
        error={errors.hobbies}
        required
        multiline
        rows={2}
      />

      <FormTextField
        label="List any organizations to which you are affiliated"
        value={safeFormData.organizations}
        onChange={(e) => handleChange("organizations", e.target.value)}
        error={errors.organizations}
        required
        multiline
        rows={2}
      />

      <Typography variant="h6" sx={{ mb: 2, mt: 3, fontWeight: 600 }}>
        PERMANENT ADDRESS
      </Typography>

      <FormTextField
        label="Street and Barangay Address"
        value={safeFormData.streetBarangay}
        onChange={(e) => handleChange("streetBarangay", e.target.value)}
        error={errors.streetBarangay}
        required
      />

      <FormTextField
        label="City/Municipality"
        value={safeFormData.cityMunicipality}
        onChange={(e) => handleChange("cityMunicipality", e.target.value)}
        error={errors.cityMunicipality}
        required
      />

      <FormTextField
        label="Province"
        value={safeFormData.province}
        onChange={(e) => handleChange("province", e.target.value)}
        error={errors.province}
        required
      />

      <FormSelect
        label="Region"
        value={safeFormData.region}
        onChange={(e) => handleChange("region", e.target.value)}
        options={regions}
        error={errors.region}
        required
      />

      <Typography variant="h6" sx={{ mb: 2, mt: 3, fontWeight: 600 }}>
        ADDRESS WHILE STUDYING IN UP MINDANAO
      </Typography>

      <FormControlLabel
        control={
          <Checkbox
            checked={safeFormData.sameAsPermanent}
            onChange={(e) => handleChange("sameAsPermanent", e.target.checked)}
          />
        }
        label="Same as Permanent Address"
        sx={{ mb: 2 }}
      />

      {!safeFormData.sameAsPermanent && (
        <Box>
          <FormTextField
            label="Street and Barangay Address"
            value={safeFormData.upStreetBarangay}
            onChange={(e) => handleChange("upStreetBarangay", e.target.value)}
            error={errors.upStreetBarangay}
            required
          />
        </Box>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
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