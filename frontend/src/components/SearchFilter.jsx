import React from "react";
import { TextField, MenuItem, Box, IconButton, InputAdornment } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";

export default function SearchFilter({
  search,
  setSearch,
  filter,
  setFilter,
  affiliations = [],
}) {
  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
      {/* Search bar */}
      <TextField
        size="small"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "#7b1d1d" }} />
            </InputAdornment>
          ),
        }}
        sx={{
          width: "250px",
          "& .MuiOutlinedInput-root": { borderRadius: "10px" },
        }}
      />

      {/* Filter dropdown */}
      <TextField
        select
        size="small"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        sx={{
          width: "180px",
          "& .MuiOutlinedInput-root": { borderRadius: "10px" },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FilterListIcon sx={{ color: "#7b1d1d" }} />
            </InputAdornment>
          ),
        }}
      >
        <MenuItem value="">All Affiliations</MenuItem>
        {affiliations.map((a, i) => (
          <MenuItem key={i} value={a}>
            {a}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}