import React from "react";

const ProfileForm = ({ data, editable = false, onChange }) => {
  const capitalizeLabel = (str) =>
    str.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());

  // Define fields per affiliation
  const affiliationFields = {
    Student: ["degreeProgram", "yearLevel", "college", "shsType", "firstCollege"],
    Faculty: ["facultyDept", "staffOffice", "staffPosition", "constituentUnit"],
    Graduate: ["gradBachelors", "yearGrad", "alumniDegree", "firstGrad", "firstGradCollege", "firstGradUP"],
    Retiree: ["retireDesignation", "retireOffice"],
    Staff: ["staffOffice", "staffPosition", "constituentUnit"]
  };

  // Common sections
  const sections = {
    "Personal Information": [
      "firstName","middleName","lastName","nickname","age","sex","birthdate",
      "indigenousAffiliation","facebookLink","hobbies","organizations"
    ],
    "Current Address": [
      "streetBarangay","cityMunicipality","province","region"
    ],
    "Permanent Address": [
      // if sameAsPermanent = true, we will show current address instead
      "upStreetBarangay","upCityMunicipality","upProvince","upRegion"
    ],
    "Affiliation / Education": affiliationFields[data.affiliation] || [],
    "Volunteer Programs / Status": [
      "volunteerPrograms","affirmativeActionSubjects","volunteerStatus",
      "tagapagUgnay","otherOrganization","organizationName","howDidYouHear"
    ]
  };

  return (
    <div>
      {Object.entries(sections).map(([sectionTitle, fields]) => {
        // Skip empty sections
        if (fields.length === 0) return null;

        return (
          <div key={sectionTitle} className="profile-section-container">
            <div className="profile-section">{sectionTitle}</div>
            <div className="modal-grid">
              {fields.map(field => {
                // Handle Permanent Address display if sameAsPermanent = true
                let valueToShow = data[field];
                if (sectionTitle === "Permanent Address" && data.sameAsPermanent) {
                  // map from current address
                  const map = {
                    upStreetBarangay: "streetBarangay",
                    upCityMunicipality: "cityMunicipality",
                    upProvince: "province",
                    upRegion: "region"
                  };
                  valueToShow = data[map[field]];
                }

                // Skip displaying sameAsPermanent boolean field
                if (field === "sameAsPermanent") return null;

                return (
                  <div className="profile-row" key={field}>
                    <label className="label">{capitalizeLabel(field)}</label>
                    {editable ? (
                      <input
                        type="text"
                        value={Array.isArray(valueToShow) ? valueToShow.join(", ") : valueToShow || ""}
                        onChange={e => onChange(field, e.target.value)}
                      />
                    ) : (
                      <div className="value">{Array.isArray(valueToShow) ? valueToShow.join(", ") : valueToShow || ""}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProfileForm;
