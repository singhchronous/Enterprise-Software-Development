// From React Lab 4 (and before). `npm run carry -- ../react-lab4` copies YOUR LoginPage.jsx over
// this file (section 01). Then section 10 adds ONE thing to it: the Google box,
// <GoogleLoginBox /> (src/pages/GoogleLoginBox.jsx), next to the password form.
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
