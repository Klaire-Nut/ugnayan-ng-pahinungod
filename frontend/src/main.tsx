import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // if it’s a JS file, keep as .js
import "./index.css"; // ✅ Tailwind styles
import { ThemeProvider } from "./components/theme-provider"; // ✅ Shadcn’s provider (you’ll get this after init)

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
