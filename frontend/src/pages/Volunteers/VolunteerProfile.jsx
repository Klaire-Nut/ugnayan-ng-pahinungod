import React, { useEffect, useState } from "react";
import { volunteerAPI } from "../../services/volunteerApi";
import "../../styles/VolunteerProfile.css";

// Reusable profile field component
const ProfileField = ({ label, value, name, editable = false, onChange, type = "text" }) => (
  <div className="profile-field">
    <label className="field-label">{label}</label>
    {editable ? (
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={(e) => onChange(name, e.target.value)}
        className="field-input"
      />
    ) : (
      <div className="field-value">{value || "—"}</div>
    )}
  </div>
);

export default function VolunteerProfile() {
  const [userData, setUserData] = useState(null);
  const [tempData, setTempData] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // -------------------------
  // LOAD PROFILE ON MOUNT
  // -------------------------
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);

      try {
        const response = await volunteerAPI.getProfile();

        if (!response.success) {
          throw new Error(response.error || "Failed to load profile");
        }

        setUserData(response.data);
        setTempData(response.data);
        setError("");
      } catch (err) {
        console.error("Profile fetch error:", err);

        if (err.response?.status === 401 || err.response?.status === 403) {
          setError("Session expired. Redirecting to login...");
          setTimeout(() => (window.location.href = "/login"), 2000);
        } else {
          setError(err.message || "Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // -------------------------
  // HANDLE EDITING FIELDS
  // -------------------------
  const handleChange = (key, value) => {
    setTempData((prev) => {
      if (key.includes(".")) {
        const [parent, child] = key.split(".");
        return { ...prev, [parent]: { ...prev[parent], [child]: value } };
      }
      return { ...prev, [key]: value };
    });
  };

  // -------------------------
  // SAVE UPDATED PROFILE
  // -------------------------
  const handleSave = async () => {
    try {
      const response = await volunteerAPI.updateProfile(tempData);

      if (!response.success) {
        alert(response.error || "Failed to update profile.");
        return;
      }

      setUserData(tempData);
      setIsEditOpen(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);
      alert(err.response?.data?.error || "Failed to update profile.");
    }
  };

  // -------------------------
  // RENDER STATES
  // -------------------------
  if (loading) return <div className="vol-profile-page">Loading profile...</div>;
  if (error) return <div className="vol-profile-page error-message">{error}</div>;
  if (!userData) return <div className="vol-profile-page">No profile data found.</div>;

  // -------------------------
  // PAGE UI
  // -------------------------
  return (
    <div className="vol-profile-page">
      <div className="vol-profile-main">

        <div className="profile-header">
          <h1 className="profile-title">PROFILE</h1>
          <button className="edit-btn" onClick={() => setIsEditOpen(true)}>Edit</button>
        </div>

        <div className="profile-grid">

          {/* LEFT PANEL */}
          <div className="profile-left">
            <img
              src={userData.profile_picture || "/default-profile.png"}
              className="profile-photo"
              alt="Profile"
            />
            <div className="volunteer-id">{userData.volunteer_id}</div>
          </div>

          {/* RIGHT PANEL */}
          <div className="profile-right">

            <section className="profile-section">
              <h3>Basic Information</h3>
              <ProfileField label="First Name" value={userData.first_name} name="first_name" />
              <ProfileField label="Middle Name" value={userData.middle_name} name="middle_name" />
              <ProfileField label="Last Name" value={userData.last_name} name="last_name" />
              <ProfileField label="Nickname" value={userData.nickname} name="nickname" />
              <ProfileField label="Sex" value={userData.sex} name="sex" />
              <ProfileField label="Birthdate" value={userData.birthdate} name="birthdate" />
              <ProfileField label="Affiliation" value={userData.affiliation_type} name="affiliation_type" />
            </section>

            <section className="profile-section">
              <h3>Contact Information</h3>
              <ProfileField label="Email" value={userData.email} name="email" />
              <ProfileField label="Mobile Number" value={userData.mobile_number} name="mobile_number" />
              <ProfileField label="Facebook" value={userData.facebook_link} name="facebook_link" />
            </section>

            <section className="profile-section">
              <h3>Address</h3>
              <ProfileField label="Street Address" value={userData.street_address} name="street_address" />
              <ProfileField label="Province" value={userData.province} name="province" />
              <ProfileField label="Region" value={userData.region} name="region" />
            </section>

            <section className="profile-section">
              <h3>Background</h3>
              <ProfileField label="Occupation" value={userData.occupation} name="occupation" />
              <ProfileField label="Organization" value={userData.org_affiliation} name="org_affiliation" />
              <ProfileField label="Hobbies" value={userData.hobbies_interests} name="hobbies_interests" />
            </section>

            {userData.emergency_contact && (
              <section className="profile-section">
                <h3>Emergency Contact</h3>
                {Object.entries(userData.emergency_contact).map(([key, value]) => (
                  <ProfileField
                    key={key}
                    label={key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    value={value}
                    name={`emergency_contact.${key}`}
                  />
                ))}
              </section>
            )}

            {userData.affiliation_data && Object.keys(userData.affiliation_data).length > 0 && (
              <section className="profile-section">
                <h3>Affiliation Details</h3>
                {Object.entries(userData.affiliation_data).map(([key, value]) => (
                  <ProfileField
                    key={key}
                    label={key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    value={value}
                    name={`affiliation_data.${key}`}
                  />
                ))}
              </section>
            )}

          </div>
        </div>

        {/* EDIT MODAL */}
        {isEditOpen && (
          <div className="edit-modal">
            <div className="edit-modal-content">
              <button className="close-btn" onClick={() => setIsEditOpen(false)}>×</button>
              <h2>Edit Profile</h2>

              <div className="modal-scroll">
                {Object.entries(tempData).map(([key, value]) => {
                  if (typeof value === "object" && value !== null) return null;
                  return (
                    <ProfileField
                      key={key}
                      label={key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      value={value}
                      name={key}
                      editable
                      onChange={handleChange}
                    />
                  );
                })}
              </div>

              <div className="modal-buttons">
                <button className="cancel-btn" onClick={() => setIsEditOpen(false)}>Cancel</button>
                <button className="save-btn" onClick={handleSave}>Save</button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
