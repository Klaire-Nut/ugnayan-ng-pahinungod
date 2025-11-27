// src/components/AdminHeader.jsx
import React from "react";
import { User } from "lucide-react";
import { IconButton } from "@mui/material";

export default function AdminHeader() {
  return (
    <header style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      width:'100%', height:'60px', padding:'0 20px', color:'#fff'
    }}>
      <div className="title">
        <div className="sub">University of the Philippines - Mindanao</div>
        <div className="main">UGNAYAN NG PAHINUNGOD</div>
      </div>

      <IconButton sx={{ color:'white' }}>
        <User />
      </IconButton>
    </header>
  );
}