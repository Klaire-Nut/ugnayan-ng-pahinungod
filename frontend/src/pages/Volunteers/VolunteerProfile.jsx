import React, { useState } from "react";
import VolunteerSidebar from "../../components/VolunteerSidebar";
import "../../styles/VolunteerProfile.css";
import ProfileForm from "../../components/ProfileForm";

// Import fake affiliation datasets
import { fakeStudent } from "../../fakeBackend/student";
import { fakeFaculty } from "../../fakeBackend/faculty";
import { fakeGraduate } from "../../fakeBackend/graduate";
import { fakeRetiree } from "../../fakeBackend/retiree";
import { fakeStaff } from "../../fakeBackend/staff";

// Choose initial user
const initialUser = fakeRetiree; 
// fakeStudent / fakeFaculty / fakeGraduate / fakeRetiree / fakeStaff

const VolunteerProfile = () => {
  const [userData, setUserData] = useState(initialUser);
  const [tempData, setTempData] = useState(initialUser);
  const [isEditOpen, setIsEditOpen] = useState(false);

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
    setTempData(userData);
    setIsEditOpen(true);
  };

  const handleClose = () => setIsEditOpen(false);

  const handleSave = () => {
    for (const key of requiredFields) {
      if (!tempData[key] || String(tempData[key]).trim() === "") {
        alert(`${key.replace(/([A-Z])/g, " $1")} cannot be empty.`);
        return;
      }
    }
    setUserData(tempData);
    setIsEditOpen(false);
  };

  const handleChange = (key, value) => {
    setTempData(prev => ({
      ...prev,
      [key]: Array.isArray(prev[key])
        ? value.split(",").map(v => v.trim())
        : value,
    }));
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
          <div className="profile-left">
            <img src={userData.profilePhoto} alt="Profile" className="profile-photo"/>
            <div className="volunteer-id">{userData.volunteerID}</div>
          </div>

          <div className="profile-right">
            <ProfileForm 
              data={userData} 
              editable={false} 
              onChange={handleChange}
            />
          </div>
        </div>

        {/* EDIT MODAL */}
        {isEditOpen && (
          <div className="edit-modal">
            <div className="edit-modal-content">
              <button className="close-btn" onClick={handleClose}>&times;</button>
              <h2>Edit Profile</h2>
              <div className="modal-scroll">
                <ProfileForm 
                  data={tempData} 
                  editable={true} 
                  onChange={handleChange}
                />
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
