import React, { useState, useMemo } from "react";
import { Box, Button } from "@mui/material";
import { useOutletContext } from "react-router-dom";
import AdminTable from "../../components/AdminTable";
import SearchFilter from "../../components/SearchFilter";

export default function AdminVolunteers() {
  const { volunteers = [] } = useOutletContext();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  // Volunteer ID generator
  const generateVolunteerID = (v, indexOnDay) => {
    if (!v.registeredAt) return "UNP-UNKNOWN";
    const d = new Date(v.registeredAt);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    const seq = String(indexOnDay + 1).padStart(2, "0");
    return `UNP${mm}${dd}${yyyy}-${seq}`;
  };

  // Process data
  const processed = volunteers.map((v, _, arr) => {
    const sameDay = arr.filter((x) => x.registeredAt === v.registeredAt);
    const indexOnDay = sameDay.findIndex((x) => x.id === v.id);
    return {
      ...v,
      volunteerID: generateVolunteerID(v, indexOnDay),
      name: `${v.firstName} ${v.lastName}`,
    };
  });

  const uniqueAffiliations = Array.from(new Set(volunteers.map((v) => v.affiliation)));

  // FILTER + SEARCH
  const filtered = useMemo(() => {
    return processed.filter((v) => {
      const matchesSearch =
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.volunteerID.toLowerCase().includes(search.toLowerCase()) ||
        v.affiliation.toLowerCase().includes(search.toLowerCase());

      const matchesFilter = filter ? v.affiliation === filter : true;

      return matchesSearch && matchesFilter;
    });
  }, [processed, search, filter]);

  const columns = [
    { header: "Volunteer ID", field: "volunteerID" },
    { header: "Name", field: "name" },
    { header: "Affiliation", field: "affiliation" },
  ];

  return (
    <div className="admin-events-wrapper">
      {/* Header Section */}
      <div className="events-header" style={{ display: "flex", justifyContent: "space-between" }}>
        <h2 className="events-title">VOLUNTEERS</h2>

        {/* Search + Filter */}
        <SearchFilter
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          affiliations={uniqueAffiliations}
        />
      </div>

      {/* Table */}
      <section className="events-section fade-in">
        <Box sx={{ mt: 1 }}>
          <AdminTable
            columns={columns}
            rows={filtered}
            actions={(row) => (
              <Button
                variant="outlined"
                size="small"
                sx={{
                  borderColor: "#7b1d1d",
                  color: "#7b1d1d",
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#7b1d1d",
                    color: "white",
                  },
                }}
                onClick={() => console.log("View volunteer", row.id)}
              >
                View
              </Button>
            )}
          />
        </Box>
      </section>
    </div>
  );
}