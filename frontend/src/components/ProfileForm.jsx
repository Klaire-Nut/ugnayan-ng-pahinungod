import React from "react";

// ProfileForm component: renders fields relevant to user's affiliation
const ProfileForm = ({ data, editable = false, onChange }) => {
  const capitalizeLabel = (str) =>
    str.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

  // Define fields per affiliation
  const affiliationFields = {
    Student: ["degreeProgram", "yearLevel", "college", "shsType", "firstCollege"],
    Faculty: ["facultyDept", "staffOffice", "staffPosition", "constituentUnit"],
    Graduate: ["gradBachelors", "yearGrad", "alumniDegree", "firstGrad", "firstGradCollege", "firstGradUP"],
    Retiree: ["retireDesignation", "retireOffice"]
  };

  // Common sections
  const sections = {
    "Personal Information": [
      "firstName","middleName","lastName","nickname","age","sex","birthdate","indigenousAffiliation","facebookLink","hobbies","organizations"
    ],
    "Current Address": [
      "streetBarangay","cityMunicipality","province","region"
    ],
    "Permanent Address": [
      "upStreetBarangay","upCityMunicipality","upProvince","upRegion"
    ],
    "Affiliation / Education": affiliationFields[data.affiliation] || [],
    "Volunteer Programs / Status": [
      "volunteerPrograms","affirmativeActionSubjects","volunteerStatus","tagapagUgnay","otherOrganization","organizationName","howDidYouHear"
    ]
  };

  return (
    <div>
      {Object.entries(sections).map(([sectionTitle, fields]) => {
        // Filter out undefined/null/N/A/empty
        const visibleFields = fields.filter(
          field => data[field] !== undefined && data[field] !== null && data[field] !== "" && data[field] !== "N/A"
        );

        if (visibleFields.length === 0) return null; // skip empty sections

        return (
          <div key={sectionTitle} className="profile-section-container">
            <div className="profile-section">{sectionTitle}</div>
            <div className="modal-grid">
              {visibleFields.map(field => (
                <div className="profile-row" key={field}>
                  <label className="label">{capitalizeLabel(field)}</label>
                  {editable ? (
                    <input
                      type="text"
                      value={Array.isArray(data[field]) ? data[field].join(", ") : data[field]}
                      onChange={e => onChange(field, e.target.value)}
                    />
                  ) : (
                    <div className="value">{Array.isArray(data[field]) ? data[field].join(", ") : data[field]}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  );
};

export default ProfileForm;
