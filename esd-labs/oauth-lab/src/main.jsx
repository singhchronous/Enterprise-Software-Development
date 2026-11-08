import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.jsx";
import { API_BASE } from "./api/client.js";
import "./styles.css";

// GIVEN. StrictMode matters in this lab: in development it runs every effect twice (mount,
// clean up, mount), and GoogleSignInButton must cope (section 08).
//
// <BrowserRouter> keeps the page in step with the address bar (React Lab 3 · §04): it reads the
// URL, re-renders when it changes, and turns <Link> clicks into history.pushState —
// a new URL without a new page load. The footer under every page says which API the app is
// talking to (React Lab 4 · §09).
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    <footer className="api-base">
      API: <code>{API_BASE || "the mock, on this server (/api)"}</code>
    </footer>
  </StrictMode>
);
