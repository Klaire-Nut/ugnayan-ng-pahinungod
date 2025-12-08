import React from "react";

export default function ProfileForm({ data, editable = false, onChange }) {
  if (!data) return null;

  // Capitalize field labels
  const label = (str) =>
    str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // Affiliation-based fields (based on your Django `affiliation_data`)
  const affiliationFields = {
    STUDENT: ["degree_program", "year_level", "college", "department"],
    ALUMNI: ["constituent_unit", "degree_program", "year_graduated"],
    "UP STAFF": ["office_department", "designation"],
    FACULTY: ["college", "department"],
    RETIREE: ["designation_while_in_up", "office_college_department"],
  };

  const sections = {
    "Personal Information": [
      "first_name",
      "middle_name",
      "last_name",
      "nickname",
      "sex",
      "birthdate",
    ],

    "Contact Information": ["email", "mobile_number", "facebook_link"],

    "Current Address": ["street_address", "province", "region"],

    "Background Information": [
      "occupation",
      "org_affiliation",
      "hobbies_interests",
    ],

    "Emergency Contact": data.emergency_contact
      ? ["name", "relationship", "contact_number", "address"]
      : [],

    "Affiliation Information":
      affiliationFields[data.affiliation_type] || [],
  };

  // Helper to read nested emergency_contact & affiliation_data
  const getValue = (field) => {
    if (!data) return "";

    if (sections["Emergency Contact"].includes(field)) {
      return data.emergency_contact?.[field] ?? "";
    }

    if (sections["Affiliation Information"].includes(field)) {
      return data.affiliation_data?.[field] ?? "";
    }

    return data[field] ?? "";
  };

  // Helper for saving nested values
  const saveValue = (field, value) => {
    if (sections["Emergency Contact"].includes(field)) {
      onChange("emergency_contact", {
        ...data.emergency_contact,
        [field]: value,
      });
      return;
    }

    if (sections["Affiliation Information"].includes(field)) {
      onChange("affiliation_data", {
        ...data.affiliation_data,
        [field]: value,
      });
      return;
    }

    onChange(field, value);
  };

  return (
    <div>
      {Object.entries(sections).map(([title, fields]) => {
        if (!fields.length) return null;

        return (
          <div key={title} className="profile-section-container">
            <div className="profile-section">{title}</div>

            <div className="modal-grid">
              {fields.map((field) => (
                <div className="profile-row" key={field}>
                  <label className="label">{label(field)}</label>

                  {editable ? (
                    <input
                      type="text"
                      value={getValue(field)}
                      onChange={(e) => saveValue(field, e.target.value)}
                    />
                  ) : (
                    <div className="value">{getValue(field) || ""}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}