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
        if (!response.success) throw new Error(response.error || "Failed to load profile");

        setUserData(response.data);
        setTempData(response.data);
        setError("");
      } catch (err) {
        console.error("Profile fetch error:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError("Session expired. Redirecting to login...");
          setTimeout(() => (window.location.href = "/login"), 2000);
        } else {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // SIMPLE version — because ProfileForm already returns correct nested objects
  const handleChange = (key, value) => {
    setTempData((prev) => ({
      ...prev,
      [key]: value
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
          <div className="profile-left">
            <img
              src={userData.profile_picture || "/default-profile.png"}
              alt="Profile"
              className="profile-photo"
            />
            <div className="volunteer-id">ID: {userData.volunteer_id}</div>
          </div>

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
              <button className="close-btn" onClick={() => setIsEditOpen(false)}>&times;</button>
              <h2>Edit Profile</h2>

              <div className="modal-scroll">
                <ProfileForm
                  data={tempData}
                  editable={true}
                  onChange={handleChange}
                />
              </div>

              <div className="modal-buttons">
                <button className="cancel-btn" onClick={() => setIsEditOpen(false)}>
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
