import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#7B1113", // UP Maroon
    },
    secondary: {
      main: "#FF7F00", // Optional accent color
    },
  },
  typography: {
    fontFamily: "Helvetica, Arial, sans-serif",
  },
});

export default theme;