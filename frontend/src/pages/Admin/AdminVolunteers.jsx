import React, { useState, useEffect,useMemo } from "react";
import { Box, Button } from "@mui/material";
import { useOutletContext } from "react-router-dom";
import AdminTable from "../../components/AdminTable";
import SearchFilter from "../../components/SearchFilter";
import { useNavigate } from "react-router-dom";


export default function AdminVolunteers() {
  const [volunteers, setVolunteers] = useState([]);
  const [loadingVolunteers, setLoadingVolunteers] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();

  /// Normalize volunteer affiliation
  const normalizeAffiliation = (affiliation) => {
    if (!affiliation) return "—";
    const lower = affiliation.toLowerCase();
    if (["student", "stud", "undergrad"].includes(lower)) return "Student";
    if (["faculty", "teacher", "professor"].includes(lower)) return "Faculty";
    if (["alumni", "grad"].includes(lower)) return "Alumni";
    if (["up staff", "staff", "employee"].includes(lower)) return "UP Staff";
    return affiliation
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  /// Process volunteers
  const processed = volunteers.map((v) => ({
    ...v,
    full_name: v.full_name || "—",
    affiliation_type: normalizeAffiliation(v.affiliation_type),
  }));


 // Fetch volunteers from backend
  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/admin/volunteers/");
        const data = await res.json();
        console.log("📌 Volunteers fetched from backend:", data);
        setVolunteers(data.results || []);
      } catch (err) {
        console.error("Failed to fetch volunteers:", err);
      } finally {
        setLoadingVolunteers(false);
      }
    };

    fetchVolunteers();
  }, []);
 

  // Filter + search
  const filtered = useMemo(() => {
    return processed.filter((v) => {
      const matchesSearch =
        (v.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (v.volunteer_identifier || "").toLowerCase().includes(search.toLowerCase()) ||
        (v.affiliation_type || "").toLowerCase().includes(search.toLowerCase());

      const matchesFilter = filter ? v.affiliation_type === filter : true;

      return matchesSearch && matchesFilter;
    });
  }, [processed, search, filter]);

  const uniqueAffiliations = Array.from(
    new Set(processed.map((v) => v.affiliation_type))
  );

  const columns = [
    { header: "Volunteer ID", field: "volunteer_identifier" },
    { header: "Name", field: "full_name" },
    { header: "Affiliation", field: "affiliation_type" },
  ];

  if (loadingVolunteers) return <p>Loading volunteers...</p>;

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
                onClick={() => navigate(`/admin/volunteers/${row.volunteer_id}`)}
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
