import React, { useState } from "react";
import VolunteerSidebar from "../../components/VolunteerSidebar";
import { fakeUser } from "../../fakeBackend";
import "../../styles/VolunteerProfile.css";

const VolunteerProfile = () => {
  const [userData, setUserData] = useState(fakeUser);
  const [tempData, setTempData] = useState(fakeUser);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleEditClick = () => {
    setTempData(userData);
    setIsEditOpen(true);
  };

  const handleClose = () => setIsEditOpen(false);

  const handleSave = () => {
    setUserData(tempData);
    setIsEditOpen(false);
  };

  const handleChange = (key, value) => {
    setTempData((prev) => ({
      ...prev,
      [key]: Array.isArray(prev[key])
        ? value.split(",").map((v) => v.trim())
        : value,
    }));
  };

  const capitalizeLabel = (str) =>
    str.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

  const sections = {
    "Personal Information": [
      "firstName",
      "middleName",
      "lastName",
      "nickname",
      "age",
      "sex",
      "birthdate",
      "indigenousAffiliation",
      "facebookLink",
      "hobbies",
      "organizations",
    ],
    "Address Information": [
      "mobileNumber",
      "email",
      "streetBarangay",
      "cityMunicipality",
      "province",
      "region",
      "sameAsPermanent",
      "upStreetBarangay",
      "upCityMunicipality",
      "upProvince",
      "upRegion",
    ],
    "Education / Affiliation": [
      "affiliation",
      "degreeProgram",
      "yearLevel",
      "college",
      "shsType",
      "gradBachelors",
      "firstCollege",
      "firstGrad",
      "firstUP",
      "emerName",
      "emerRelation",
      "emerContact",
      "emerAddress",
      "facultyDept",
      "constituentUnit",
      "alumniDegree",
      "yearGrad",
      "firstGradCollege",
      "firstGradUP",
      "occupation",
      "retireDesignation",
      "retireOffice",
      "staffOffice",
      "staffPosition",
    ],
    "Volunteer Programs / Status": [
      "volunteerPrograms",
      "affirmativeActionSubjects",
      "volunteerStatus",
      "tagapagUgnay",
      "otherOrganization",
      "organizationName",
      "howDidYouHear",
    ],
  };

  return (
    <div className="vol-profile-page">
      <VolunteerSidebar />

      <div className="vol-profile-main">
        {/* HEADER */}
        <div className="profile-header">
          <h1 className="profile-title">PROFILE</h1>
          <button className="edit-btn" onClick={handleEditClick}>
            Edit
          </button>
        </div>

        {/* PROFILE GRID */}
        <div className="profile-grid">
          <div className="profile-left">
            <img
              src={userData.profilePhoto}
              alt="Profile"
              className="profile-photo"
            />
            <div className="volunteer-id">{userData.volunteerID}</div>
          </div>

          <div className="profile-right">
            {Object.entries(sections).map(([sectionTitle, fields]) => (
              <div key={sectionTitle} className="profile-section-container">
                <div className="profile-section">{sectionTitle}</div>
                <div className="modal-grid">
                  {fields.map((field) => (
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
                <button className="close-btn" onClick={handleClose}>
                  &times;
                </button>
                <h2>Edit Profile</h2>
                <div className="modal-scroll">
                  {Object.entries(sections).map(([sectionTitle, fields]) => (
                    <div key={sectionTitle}>
                      <div className="profile-section">{sectionTitle}</div>
                      <div className="modal-grid">
                        {fields.map((field) => (
                          <div className="profile-row" key={field}>
                            <label>{capitalizeLabel(field)}</label>
                            <input
                              type="text"
                              value={
                                Array.isArray(tempData[field])
                                  ? tempData[field].join(", ")
                                  : String(tempData[field])
                              }
                              onChange={(e) => handleChange(field, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="modal-buttons">
                  <button className="cancel-btn" onClick={handleClose}>
                    Cancel
                  </button>
                  <button className="save-btn" onClick={handleSave}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default VolunteerProfile;
