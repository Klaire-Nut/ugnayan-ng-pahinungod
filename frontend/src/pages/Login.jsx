import React, { useState } from "react";
import LoginPopup from "../components/LoginPopup";

export default function Login() {
  const [open, setOpen] = useState(true); // popup shows immediately

  return (
    <>
      <LoginPopup
        open={open}
        onClose={() => setOpen(false)}
        role="Volunteer"
      />
    </>
  );
}
