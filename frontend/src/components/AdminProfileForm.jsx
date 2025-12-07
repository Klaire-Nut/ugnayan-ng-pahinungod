// src/components/AdminProfileForm.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const AdminProfileForm = ({
  data = {},
  editable = false,
  onChange,
  onEdit,
  onSave,
  onCancel,
  totalRenderedHours,
  onRenderedHoursChange
}) => {

  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go back to previous page (volunteer list)
  };

  const sections = {
    "Volunteer Info": [
      "firstName", "middleName", "lastName", "nickname", "sex", "birthdate", "status"
    ],
    "Contact Info": [
      "mobileNumber", "facebookLink"
    ],
    "Address": [
      "streetAddress", "province", "region"
    ],
    "Background": [
      "orgAffiliation", "occupation", "hobbiesInterests"
    ],
    "Emergency Contact": [
      "emergencyName", "emergencyRelationship", "emergencyContactNumber", "emergencyAddress"
    ],
    "Affiliation Details": [
      ...(() => {
        switch ((data.affiliation || "").toLowerCase()) {
      case "student":
        return ["degreeProgram", "yearLevel", "college", "department"];
      case "alumni":
        return ["constituentUnit", "degreeProgramAlumni", "yearGraduated"];
      case "staff":
        return ["officeDepartment", "designation"];
      case "faculty":
        return ["collegeFaculty", "departmentFaculty"];
      case "retiree":
        return ["designationWhileInUP", "officeCollegeDepartment"];
      default:
        return [];
        }
      })()
    ]
  };

   // Make a nice human label from camelCase field keys
  const capitalizeLabel = (str = "") =>
    str
      .replace(/([A-Z])/g, " $1")  
      .replace(/^./, (s) => s.toUpperCase()) 
      .replace(/Id$/, " ID"); 

  // Render single field (label + value or input)
  const renderField = (field) => {
  const value = data[field] ?? "";
  const label = capitalizeLabel(field);

  return (
    <div className="profile-row" key={field}>
      <div className="label">{label}</div>

      {editable ? (
        <input
          type={field === "totalRenderedHours" ? "number" : "text"}
          value={value}
          onChange={(e) => {
            const val =
              field === "totalRenderedHours"
                ? Number(e.target.value)
                : e.target.value;
            onChange && onChange(field, val);
          }}
        />
      ) : (
        <div className="value">
          {value !== null && value !== undefined && value !== ""
            ? Array.isArray(value)
              ? value.join(", ")
              : value
            : "--"}
        </div>
      )}
    </div>
  );
};


  
  // INLINE CSS (already corrected)
    const styles = `
    .vol-profile-page {
      display: flex;
      width: 100%;
      min-height: 100vh;
      background-color: #f5f5f5;
      overflow-x: hidden;
    }
    .vol-profile-main {
      flex: 1;
      padding: 2rem 3rem;
    }
    .profile-title {
      font-size: 1.8rem;
      font-weight: 900;
      color: #6e1b1b;
      margin-bottom: 1.5rem;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 2rem;
    }

    .profile-left {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .profile-photo {
      width: 180px;
      height: 180px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #6e1b1b;
    }
    .volunteer-id {
      margin-top: 0.75rem;
      font-size: 1.1rem;
      font-weight: 700;
      color: #6e1b1b;
      text-align: center;
      background: #ffffff;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      border: 2px solid #6e1b1b;
      width: 100%;
    }

    .profile-right {
      display: grid;
      gap: 1.5rem;
    }

    .profile-section {
      font-size: 1.3rem;
      font-weight: 700;
      color: #6e1b1b;
      margin-bottom: 0.75rem;
      border-bottom: 2px solid #6e1b1b;
      padding-bottom: 0.5rem;
      padding-top: 1rem;
    }

    .modal-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem 1.5rem;
    }
    .profile-row {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .label {
      font-size: 0.9rem;
      font-weight: 600;
      color: #883232;
    }
    .value {
      background: white;
      padding: 0.6rem 1rem;
      border-radius: 8px;
      font-size: 1rem;
      color: #444;
      border: 1px solid #ddd;
    }
    input[type="text"] {
      width: 100%;
      padding: 0.6rem 1rem;
      border-radius: 8px;
      border: 1px solid #ccc;
      font-size: 1rem;
    }
    .profile-actions {
      display: flex;
      justify-content: flex-end;
      width: 100%;
      margin-bottom: 1rem;
      margin-top: -1.5rem;   /* moves edit button upward slightly */
    }

  `;

  return (
    <>
      <style>{styles}</style>

           <div className="profile-actions">
        {editable ? (
          <>
            <button className="save-btn" onClick={onSave}>Save</button>
            <button className="cancel-btn" onClick={onCancel}>Cancel</button>
          </>
        ) : (
          <button className="edit-btn" onClick={onEdit}>Edit</button>
        )}
      </div>

          <div className="profile-grid">
          {/* LEFT */}
          <div className="profile-left">
            <img src={data.photoUrl || "/default_pfp.png"} alt="" className="profile-photo" />
            <div className="volunteer-id">Volunteer #{data.volunteerUniqueID || "--"}</div>
          </div>

          {/* RIGHT */}
          <div className="profile-right">
            {Object.entries(sections).map(([title, fields]) => (
          <div key={title}>
            <div className="profile-section">{title}</div>

            <div className="modal-grid">

              {fields.map(f => renderField(f))}

              {title === "Volunteer Info" && (
              <div className="profile-row">
                <div className="label">Total Rendered Hours</div>


                {editable ? (
                  <input
                    type="number"
                    value={totalRenderedHours}
                    onChange={(e) => onRenderedHoursChange(Number(e.target.value))}
                  />
                ) : (
                  <div className="value">
                    {totalRenderedHours ?? "--"}
                  </div>
                )}
              </div>
            )}
            </div>
          </div>
        ))}
          </div>
        </div>
    </>
  );
};

export default AdminProfileForm;