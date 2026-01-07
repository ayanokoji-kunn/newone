import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App"; // if Appdashboard.jsx is in src/

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);