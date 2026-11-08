// IN-LAB TASK (section 15) — leave this until the lab. inlab/CONTRACT.md is the spec.
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
  throw new Error("TODO: the in-lab task (section 15, inlab/CONTRACT.md)");
}
