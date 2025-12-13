import React, { useEffect, useState } from "react";
import { volunteerAPI } from "../../services/volunteerApi";
import "../../styles/VolunteerProfile.css";
import ProfileForm from "../../components/ProfileForm";
import VolunteerSidebar from "../../components/VolunteerSidebar";

export default function VolunteerProfile() {
  const [userData, setUserData] = useState(null);
  const [tempData, setTempData] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (field, value) => {
    setTempData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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

  if (loading) return <div className="vol-profile-page">Loading profile...</div>;
  if (error) return <div className="vol-profile-page error-message">{error}</div>;
  if (!userData) return <div className="vol-profile-page">No profile data found.</div>;

  return (
    <div className="vol-profile-page">
      <VolunteerSidebar />

      <div className="vol-profile-main">
        <div className="profile-header">
          <h1 className="profile-title">PROFILE</h1>
          <button className="edit-btn" onClick={() => setIsEditOpen(true)}>Edit</button>
        </div>

        <div className="profile-grid">
          {/* LEFT SECTION */}
          <div className="profile-left">
            <img
              src={userData.profile_picture || "/default-profile.png"}
              alt="Profile"
              className="profile-photo"
            />

            <div className="volunteer-id">
              {userData.volunteer?.volunteer_identifier}
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="profile-right">
            <ProfileForm
              data={userData}
              editable={false}
              onChange={handleChange}
            />
          </div>
        </div>

        {isEditOpen && (
          <div className="edit-modal">
            <div className="edit-modal-content">
              <button className="close-btn" onClick={() => setIsEditOpen(false)}>
                &times;
              </button>
              <h2>Edit Profile</h2>

              <div className="modal-scroll">
                <ProfileForm
                  data={tempData}
                  editable={true}
                  onChange={handleChange}
                />
              </div>

              <div className="modal-buttons">
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setTempData(userData);
                    setIsEditOpen(false);
                  }}
                >
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
}
