// From React Lab 3. `npm run carry -- ../react-lab3` copies YOUR LoginPage.jsx over this file
// (section 01). Then this lab changes it:
//   "Your session has expired — log in again" when useAuth().expired   (section 06)
//   a "Sign up" link to /signup, passing location.state along          (section 07)
//   stretch: the server's fieldErrors under each field                 (section 07)
//
// The login page (React Lab 3 · §10). A controlled form, like AddCourseForm in Lab 2.
// On success: back to where the user was going (location.state.from — put there by
// RequireAuth, or by the Enroll button), or to "/" if they came here directly.
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext.jsx";

export function LoginPage() {
  // TODO (React Lab 3 · §10): a controlled form — Email and Password inputs with labels, a
  // "Log in" button, the error message (role="alert") when login fails — then navigate
  // back to where the user came from.
  return <h1>Log in</h1>;
}
