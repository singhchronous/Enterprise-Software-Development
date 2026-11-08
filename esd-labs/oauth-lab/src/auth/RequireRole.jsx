// From React Lab 4 (and before). `npm run carry -- ../react-lab4` copies YOUR RequireRole.jsx over this
// file (section 01). This lab doesn't change it.
//
// React Lab 3's in-lab task (its §15; the spec was its inlab/CONTRACT.md).
//
//   <Route path="admin/courses/new"
//          element={<RequireRole role="ADMIN"><NewCoursePage /></RequireRole>} />
//
// Not logged in → off to /login, like RequireAuth. Logged in with the wrong role → a
// "You don't have access" page, right here — NOT a redirect to /login: they are logged
// in, and sending them there would only bring them straight back.
import { Link, Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "./AuthContext.jsx";

export function RequireRole({ role, children }) {
  throw new Error("TODO — from React Lab 3's in-lab task: run npm run carry (section 01 of the doc)");
}
