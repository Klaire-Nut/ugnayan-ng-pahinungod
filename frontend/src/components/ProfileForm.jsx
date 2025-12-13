import React from "react";

export default function ProfileForm({ data, editable = false, onChange }) {
  if (!data) return null;

  const label = (str) =>
    str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const affiliation =
    Array.isArray(data.affiliation_data) && data.affiliation_data.length
      ? data.affiliation_data[0]
      : {};

  const meta = data.meta || {};

  const ALL_PROGRAMS = [
    "PROGRAMS UNDER THE UP BARMM-MBHTE MOU",
    "ENVIRONMENTAL AWARENESS PROGRAM",
    "TUTORIAL SERVICES PROGRAM",
    "UGNAYAN NG PAHINUNGOD ONLINE PROGRAM",
    "COMMUNITY SERVICE PROGRAM",
    "OTHER PROGRAMS",
  ];

  const META_FIELDS = [
    "volunteer_status",
    "tagapag_ugnay",
    "other_organization",
    "organization_name",
    "how_did_you_hear",
  ];

  const AFFIRMATIVE_SUBJECTS = meta.affirmative_action_subjects || [];

  // -----------------------------
  // Section structure
  // -----------------------------
  const sections = {
    "Personal Information": [
      "first_name",
      "middle_name",
      "last_name",
      "nickname",
      "sex",
      "birthdate",
      "email",
    ],
    "Contact Information": ["mobile_number", "facebook_link"],
    "Current Address": ["street_address", "province", "region"],
    "Background Information": ["org_affiliation", "hobbies_interests"],
    "Emergency Contact": ["name", "relationship", "contact_number", "address"],
    "Affiliation Information": [
      "affiliation_type",
      ...(
        affiliation
          ? Object.keys(affiliation).filter((k) => k !== "type")
          : []
      )
    ],
    "Volunteer Application Details": META_FIELDS,
    "Program Interests": ALL_PROGRAMS,
    "Affirmative Action Subjects": AFFIRMATIVE_SUBJECTS,
  };

  // -----------------------------
  // Value Getter
  // -----------------------------
  const getValue = (section, field) => {
    switch (section) {
      case "Personal Information":
        if (field === "volunteer_identifier") return data.volunteer_identifier;
        return data.volunteer?.[field] ?? "";

      case "Contact Information":
        return data.contact?.[field] ?? "";

      case "Current Address":
        return data.address?.[field] ?? "";

      case "Background Information":
        return data.background?.[field] ?? "";

      case "Emergency Contact":
        return data.emergency_contact?.[field] ?? "";

      case "Affiliation Information":
        if (field === "affiliation_type") {
          return data.volunteer?.affiliation_type ?? "";
        }
        return affiliation?.[field] ?? "";

      case "Volunteer Application Details":
        return meta?.[field] ?? "";

      case "Program Interests":
        return data.program_interests?.includes(field) ?? false;

      case "Affirmative Action Subjects":
        return AFFIRMATIVE_SUBJECTS.includes(field);

      default:
        return "";
    }
  };

  // -----------------------------
  // Save Handler
  // -----------------------------
  const saveValue = (section, field, value) => {
    switch (section) {
      case "Personal Information":
        return onChange("volunteer", { ...data.volunteer, [field]: value });

      case "Contact Information":
        return onChange("contact", { ...data.contact, [field]: value });

      case "Current Address":
        return onChange("address", { ...data.address, [field]: value });

      case "Background Information":
        return onChange("background", { ...data.background, [field]: value });

      case "Emergency Contact":
        return onChange("emergency_contact", {
          ...data.emergency_contact,
          [field]: value,
        });

      case "Affiliation Information":
        if (field === "affiliation_type") {
          return data.volunteer?.affiliation_type ?? "";
        }
        return affiliation?.[field] ?? "";

      case "Volunteer Application Details":
        return onChange("meta", { ...meta, [field]: value });

      case "Program Interests":
        const current = [...(data.program_interests || [])];
        if (current.includes(field)) {
          return onChange(
            "program_interests",
            current.filter((p) => p !== field)
          );
        } else {
          return onChange("program_interests", [...current, field]);
        }

      case "Affirmative Action Subjects":
        let subjects = [...AFFIRMATIVE_SUBJECTS];
        if (subjects.includes(field)) {
          subjects = subjects.filter((x) => x !== field);
        } else {
          subjects.push(field);
        }
        return onChange("meta", {
          ...meta,
          affirmative_action_subjects: subjects,
        });

      default:
        return;
    }
  };

  return (
    <div>
      {Object.entries(sections).map(([sectionTitle, fields]) => {
        if (!fields || fields.length === 0) return null;

        return (
          <div key={sectionTitle} className="profile-section-container">
            <div className="profile-section">{sectionTitle}</div>

            <div className="modal-grid">
              {/* PROGRAMS & SUBJECT CHECKBOXES */}
              {(sectionTitle === "Program Interests" ||
                sectionTitle === "Affirmative Action Subjects") &&
                fields.map((field) => (
                  <div className="profile-row" key={field}>
                    {editable ? (
                      <label>
                        <input
                          type="checkbox"
                          checked={getValue(sectionTitle, field)}
                          onChange={() => saveValue(sectionTitle, field)}
                        />{" "}
                        {field}
                      </label>
                    ) : (
                      getValue(sectionTitle, field) && (
                        <div className="value">{field}</div>
                      )
                    )}
                  </div>
                ))}

              {/* NORMAL INPUT FIELDS */}
              {sectionTitle !== "Program Interests" &&
                sectionTitle !== "Affirmative Action Subjects" &&
                fields.map((field) => (
                  <div className="profile-row" key={field}>
                    <label className="label">{label(field)}</label>
                    {editable ? (
                      <input
                        type="text"
                        value={getValue(sectionTitle, field)}
                        onChange={(e) =>
                          saveValue(sectionTitle, field, e.target.value)
                        }
                      />
                    ) : (
                      getValue(sectionTitle, field) !== "" && (
                        <div className="value">
                          {getValue(sectionTitle, field)}
                        </div>
                      )
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
