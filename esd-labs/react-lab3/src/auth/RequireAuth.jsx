// A protected route (section 11). Wrap a page in it:
//
//   <Route path="me" element={<RequireAuth><MyCoursesPage /></RequireAuth>} />
//
// Logged in → it renders what it wraps (or the child routes, through <Outlet />, when it's
// used as a layout route). Not logged in → it redirects to /login, and remembers where you
// were going in the navigation state, so the login page can send you back.
//
// This is a convenience for the user, not security: the API still refuses every request
// that doesn't carry a valid token (try it — section 11).
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "./AuthContext.jsx";

export function RequireAuth({ children }) {
  // TODO (section 11): nobody logged in → <Navigate> to /login, with the current location
  // in its state as `from`. Until then, everyone gets in.
  return children ?? <Outlet />;
}
