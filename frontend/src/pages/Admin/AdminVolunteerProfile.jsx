// src/pages/Admin/AdminVolunteerProfile.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminProfileForm from "../../components/AdminProfileForm";
import { fetchAdminVolunteerById, updateVolunteer } from "../../services/adminApi";

const AdminVolunteerProfile = () => {
  const { volunteerId } = useParams();
  const [volunteerData, setVolunteerData] = useState({});
  const [editable, setEditable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [originalData, setOriginalData] = useState({});
  const [totalRenderedHours, setTotalRenderedHours] = useState(0);

  // Fetch volunteer data
  const fetchVolunteer = async () => {
    try {
      setLoading(true);
      const response = await fetchAdminVolunteerById(volunteerId);

      // Make sure you get the actual data object
      const data = response.data || response; 
      const mappedData = mapBackendToProfileForm(data);

      //newly added
      setTotalRenderedHours(mappedData.totalRenderedHours);

      setVolunteerData(mappedData);
      setOriginalData(mappedData);
      setTotalRenderedHours(mappedData.totalRenderedHours);

    } catch (err) {
      console.error("Error fetching volunteer:", err);
      alert("Failed to fetch volunteer data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteer();
  }, [volunteerId]);



  // Handle field changes in editable mode
    const handleChange = (field, value) => {
    setVolunteerData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  // Save updated data to backend
  const handleSave = async () => {
  try {
    // Use the mapping helper to generate backend payload
    const payload = mapProfileFormToBackend(volunteerData, originalData);

    // Include totalRenderedHours separately
    if (totalRenderedHours !== originalData.totalRenderedHours) {
      payload.total_hours = totalRenderedHours;
    }

    if (Object.keys(payload).length === 0) {
      console.log("Nothing changed.");
      return;
    }

    console.log("Payload being sent to backend:", payload);

    await updateVolunteer(volunteerId, payload);

    await fetchVolunteer();   

    setEditable(false);
    alert("Volunteer updated successfully!");
  } catch (error) {
    console.error("Error saving volunteer:", error);
  }
};



  // Cancel editing
  const handleCancel = () => {
    fetchVolunteer();
    setEditable(false);
  };

  if (loading) return <div>Loading volunteer data...</div>;

  return (
    <div className="vol-profile-page">
      <div className="vol-profile-main">
        <div className="profile-header">
          <h2 className="profile-title">Profile</h2>
        </div>

        {/* ProfileForm handles displaying all fields */}
        <AdminProfileForm
          data={volunteerData}
          editable={editable}
          onChange={handleChange}
          totalRenderedHours={totalRenderedHours} 
          onRenderedHoursChange={setTotalRenderedHours}  
          onEdit={() => setEditable(true)}
          onSave={handleSave}
          onCancel={handleCancel}
        />

      </div>
    </div>
  );
};

/// Map backend API to frontend form
const mapBackendToProfileForm = (data) => ({
  volunteerUniqueID: data.volunteer_identifier,
  firstName: data.first_name,
  middleName: data.middle_name,
  lastName: data.last_name,
  nickname: data.nickname,
  sex: data.sex,
  birthdate: data.birthdate,
  status: data.status,
  totalRenderedHours: data.total_hours,

  // Contacts
  contactId: data.contacts?.[0]?.contact_id,
  mobileNumber: data.contacts?.[0]?.mobile_number || "",
  facebookLink: data.contacts?.[0]?.facebook_link || "",

  // Address
  addressId: data.addresses?.[0]?.address_id,
  streetAddress: data.addresses?.[0]?.street_address || "",
  province: data.addresses?.[0]?.province || "",
  region: data.addresses?.[0]?.region || "",

  // Background
  backgroundId: data.backgrounds?.[0]?.background_id,
  orgAffiliation: data.backgrounds?.[0]?.org_affiliation || "",
  occupation: data.backgrounds?.[0]?.occupation || "",
  hobbiesInterests: data.backgrounds?.[0]?.hobbies_interests || "",

  // Emergency Contact
  emergencyId: data.emergency_contacts?.[0]?.contact_id,
  emergencyName: data.emergency_contacts?.[0]?.name || "",
  emergencyRelationship: data.emergency_contacts?.[0]?.relationship || "",
  emergencyContactNumber: data.emergency_contacts?.[0]?.contact_number || "",
  emergencyAddress: data.emergency_contacts?.[0]?.address || "",

  // Affiliation type
  affiliation: data.affiliation_type,

  // Nested profiles for backend usage
  studentProfile: data.student_profile || {},
  alumniProfile: data.alumni_profile || {},
  staffProfile: data.staff_profile || {},
  facultyProfile: data.faculty_profile || {},
  retireeProfile: data.retiree_profile || {},

  // Map for frontend display
  degreeProgram: data.student_profile?.degree_program || "",
  yearLevel: data.student_profile?.year_level || "",
  college: data.student_profile?.college || "",
  department: data.student_profile?.department || "",

  // Alumni
  constituentUnit: data.alumni_profile?.constituent_unit || "",
  degreeProgramAlumni: data.alumni_profile?.degree_program || "",
  yearGraduated: data.alumni_profile?.year_graduated || "",

  // Staff
  officeDepartment: data.staff_profile?.office_department || "",
  designation: data.staff_profile?.designation || "",

  // Faculty
  collegeFaculty: data.faculty_profile?.college || "",
  departmentFaculty: data.faculty_profile?.department || "",

  // Retiree
  designationWhileInUP: data.retiree_profile?.designation_while_in_up || "",
  officeCollegeDepartment: data.retiree_profile?.office_college_department || "",
});

// Map frontend form to backend payload
/**
 * Generate a backend payload containing only changed fields
 * @param {object} currentData - current state of the form
 * @param {object} originalData - original state from backend
 * @returns {object} payload for PUT request
 */
export const mapProfileFormToBackend = (currentData, originalData) => {
  const payload = {};

  // Helper for top-level fields
  const topLevelFields = [
    "firstName", "middleName", "lastName", "nickname",
    "sex", "birthdate", "status", "totalRenderedHours"
  ];

  topLevelFields.forEach(f => {
    if (currentData[f] !== originalData[f]) {
      const backendKey = f === "totalRenderedHours" 
        ? "total_hours" 
        : f.replace(/([A-Z])/g, "_$1").toLowerCase();
      payload[backendKey] = currentData[f];
    }
  });

  // Contacts
  if (
    currentData.mobileNumber !== originalData.mobileNumber ||
    currentData.facebookLink !== originalData.facebookLink
  ) {
    payload.contacts = [{
      contact_id: currentData.contactId,
      mobile_number: currentData.mobileNumber,
      facebook_link: currentData.facebookLink
    }];
  }

  // Addresses
  if (
    currentData.streetAddress !== originalData.streetAddress ||
    currentData.province !== originalData.province ||
    currentData.region !== originalData.region
  ) {
    payload.addresses = [{
      address_id: currentData.addressId,
      street_address: currentData.streetAddress,
      province: currentData.province,
      region: currentData.region
    }];
  }

  // Backgrounds
  if (
    currentData.orgAffiliation !== originalData.orgAffiliation ||
    currentData.occupation !== originalData.occupation ||
    currentData.hobbiesInterests !== originalData.hobbiesInterests
  ) {
    payload.backgrounds = [{
      background_id: currentData.backgroundId,
      org_affiliation: currentData.orgAffiliation,
      occupation: currentData.occupation,
      hobbies_interests: currentData.hobbiesInterests
    }];
  }

  // Emergency contacts
  if (
    currentData.emergencyName !== originalData.emergencyName ||
    currentData.emergencyRelationship !== originalData.emergencyRelationship ||
    currentData.emergencyContactNumber !== originalData.emergencyContactNumber ||
    currentData.emergencyAddress !== originalData.emergencyAddress
  ) {
    payload.emergency_contacts = [{
      contact_id: currentData.emergencyId,
      name: currentData.emergencyName,
      relationship: currentData.emergencyRelationship,
      contact_number: currentData.emergencyContactNumber,
      address: currentData.emergencyAddress
    }];
  }

  // Affiliation type
  if (currentData.affiliation !== originalData.affiliation) {
    payload.affiliation_type = currentData.affiliation;
  }

  // Nested profiles for affiliation (send only changed fields)
  const addProfile = (profileName, fieldsMap) => {
    const changed = {};
    Object.entries(fieldsMap).forEach(([key, backendKey]) => {
      if (currentData[key] !== originalData[key]) {
        changed[backendKey] = currentData[key];
      }
    });
    if (Object.keys(changed).length > 0) {
      payload[profileName] = changed;
    }
  };

  if (currentData.affiliation === "Student") {
    addProfile("student_profile", {
      degreeProgram: "degree_program",
      yearLevel: "year_level",
      college: "college",
      department: "department"
    });
  }

  if (currentData.affiliation === "Alumni") {
    addProfile("alumni_profile", {
      constituentUnit: "constituent_unit",
      degreeProgramAlumni: "degree_program",
      yearGraduated: "year_graduated"
    });
  }

  if (currentData.affiliation === "Staff") {
    addProfile("staff_profile", {
      officeDepartment: "office_department",
      designation: "designation"
    });
  }

  if (currentData.affiliation === "Faculty") {
    addProfile("faculty_profile", {
      collegeFaculty: "college",
      departmentFaculty: "department"
    });
  }

  if (currentData.affiliation === "Retiree") {
    addProfile("retiree_profile", {
      designationWhileInUP: "designation_while_in_up",
      officeCollegeDepartment: "office_college_department"
    });
  }

  return payload;
};

export default AdminVolunteerProfile;