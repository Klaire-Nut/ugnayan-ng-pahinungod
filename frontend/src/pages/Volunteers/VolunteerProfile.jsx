import React, { useState } from "react";
import VolunteerSidebar from "../../components/VolunteerSidebar";
import "../../styles/VolunteerProfile.css";
import ProfileForm from "../../components/ProfileForm";

// Import fake affiliation datasets
import { fakeStudent } from "../../fakeBackend/student";
import { fakeFaculty } from "../../fakeBackend/faculty";
import { fakeGraduate } from "../../fakeBackend/graduate";
import { fakeRetiree } from "../../fakeBackend/retiree";

// Choose initial user
const initialUser = fakeGraduate; 
// fakeStudent / fakeFaculty / fakeGraduate / fakeRetiree

const VolunteerProfile = () => {
  const [userData, setUserData] = useState(initialUser); // saved profile data
  const [tempData, setTempData] = useState(initialUser); // editable modal data
  const [isEditOpen, setIsEditOpen] = useState(false);   // modal open state

  // REQUIRED FIELDS (cannot be blank)
  const requiredFields = [
    "firstName",
    "lastName",
    "email",
    "mobileNumber",
    "sex",
    "birthdate",
    "affiliation",
  ];

  const handleEditClick = () => {
    setTempData(userData); // copy current data into tempData for editing
    setIsEditOpen(true);
  };

  const handleClose = () => setIsEditOpen(false);

  // ---------------------------
  // SAVE LOGIC
  // - Validate required fields on Save
  // - Optional fields can remain blank if user wants
  // ---------------------------
  const handleSave = () => {
    for (const key of requiredFields) {
      if (!tempData[key] || String(tempData[key]).trim() === "") {
        alert(`${key.replace(/([A-Z])/g, " $1")} cannot be empty.`);
        return;
      }
    }

    setUserData(tempData); // save all edits
    setIsEditOpen(false);
  };

  // ---------------------------
  // HANDLE CHANGE IN MODAL
  // - Controlled input updates tempData only
  // - Arrays are split/join by comma
  // - No auto-restore while typing → UX smooth
  // ---------------------------
  const handleChange = (key, value) => {
    setTempData(prev => ({
      ...prev,
      [key]: Array.isArray(prev[key])
        ? value.split(",").map(v => v.trim())
        : value,
    }));
  };

  // Dynamic sections mapping
  const sections = {
    "Personal Information": [
      "firstName","middleName","lastName","nickname","age","sex","birthdate",
      "indigenousAffiliation","facebookLink","hobbies","organizations",
    ],
    "Address Information": [
      "mobileNumber","email","streetBarangay","cityMunicipality","province","region",
      "sameAsPermanent","upStreetBarangay","upCityMunicipality","upProvince","upRegion",
    ],
    "Education / Affiliation": [
      "affiliation","degreeProgram","yearLevel","college","shsType","gradBachelors",
      "firstCollege","firstGrad","firstGradCollege","firstGradUP","emerName","emerRelation",
      "emerContact","emerAddress","facultyDept","constituentUnit","alumniDegree","yearGrad",
      "occupation","retireDesignation","retireOffice","staffOffice","staffPosition",
    ],
    "Volunteer Programs / Status": [
      "volunteerPrograms","affirmativeActionSubjects","volunteerStatus",
      "tagapagUgnay","otherOrganization","organizationName","howDidYouHear",
    ],
  };

  const capitalizeLabel = (str) =>
    str.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());

  return (
    <div className="vol-profile-page">
      <VolunteerSidebar />

      <div className="vol-profile-main">
        {/* HEADER */}
        <div className="profile-header">
          <h1 className="profile-title">PROFILE</h1>
          <button className="edit-btn" onClick={handleEditClick}>Edit</button>
        </div>

        {/* PROFILE GRID */}
        <div className="profile-grid">
          {/* LEFT COLUMN */}
          <div className="profile-left">
            <img src={userData.profilePhoto} alt="Profile" className="profile-photo"/>
            <div className="volunteer-id">{userData.volunteerID}</div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="profile-right">
            {Object.entries(sections).map(([sectionTitle, fields]) => (
              <div key={sectionTitle} className="profile-section-container">
                <div className="profile-section">{sectionTitle}</div>
                <div className="modal-grid">
                  {fields.map(field => (
                    <div className="profile-row" key={field}>
                      <label className="label">{capitalizeLabel(field)}</label>
                      <div className="value">
                        {Array.isArray(userData[field])
                          ? userData[field].join(", ")
                          : String(userData[field])}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EDIT MODAL */}
        {isEditOpen && (
          <div className="edit-modal">
            <div className="edit-modal-content">
              <button className="close-btn" onClick={handleClose}>&times;</button>
              <h2>Edit Profile</h2>
              <div className="modal-scroll">
                {Object.entries(sections).map(([sectionTitle, fields]) => (
                  <div key={sectionTitle}>
                    <div className="profile-section">{sectionTitle}</div>
                    <div className="modal-grid">
                      {fields.map(field => (
                        <div className="profile-row" key={field}>
                          <label>{capitalizeLabel(field)}</label>
                          {/* PATCHED: Inputs edit tempData only, no auto-restore */}
                          <input
                            type="text"
                            value={
                              Array.isArray(tempData[field])
                                ? tempData[field].join(", ")
                                : String(tempData[field])
                            }
                            onChange={e => handleChange(field, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-buttons">
                <button className="cancel-btn" onClick={handleClose}>Cancel</button>
                <button className="save-btn" onClick={handleSave}>Save</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VolunteerProfile;
