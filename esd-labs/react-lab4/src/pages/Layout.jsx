// From React Lab 3. `npm run carry -- ../react-lab3` copies YOUR Layout.jsx over this file
// (section 01). This lab doesn't change it.
//
// The frame around every page (React Lab 3 · §05): a header with the navigation, and an <Outlet />
// where the matched child route's page appears. React Lab 3 §10 adds who's logged in.
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext.jsx";

export function Layout() {
  // TODO (React Lab 3 · §05): a <header> with a <nav> — links to "/" (Courses), "/me" (My courses)
  // and "/login" (Log in) — then a <main> with an <Outlet /> inside.
  // React Lab 3 §10 replaces "Log in" with the user's name and a Log out button when logged in.
  return <main>TODO: Layout (React Lab 3 · §05)</main>;
}
