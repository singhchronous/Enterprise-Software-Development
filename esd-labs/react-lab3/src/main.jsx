import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.jsx";
import "./styles.css";

// <BrowserRouter> keeps the page in step with the address bar (section 04): it reads the
// URL, re-renders when it changes, and turns <Link> clicks into history.pushState —
// a new URL without a new page load.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
