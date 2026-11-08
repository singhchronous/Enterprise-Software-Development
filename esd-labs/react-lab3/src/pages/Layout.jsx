// The frame around every page (section 05): a header with the navigation, and an <Outlet />
// where the matched child route's page appears. Section 10 adds who's logged in.
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext.jsx";

export function Layout() {
  // TODO (section 05): a <header> with a <nav> — links to "/" (Courses), "/me" (My courses)
  // and "/login" (Log in) — then a <main> with an <Outlet /> inside.
  // Section 10 replaces "Log in" with the user's name, a role badge and a Log out button
  // when logged in; section 11 makes the Log in link remember where you were.
  return <main>TODO: Layout (section 05)</main>;
}
