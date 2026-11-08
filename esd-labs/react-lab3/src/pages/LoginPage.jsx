// The login page (section 10). A controlled form, like AddCourseForm in Lab 2.
// On success: back to where the user was going (location.state.from — put there by
// RequireAuth, or by the Enroll button), or to "/" if they came here directly.
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext.jsx";

export function LoginPage() {
  // TODO (section 10): a controlled form — Email and Password inputs with labels, a
  // "Log in" button, the error message (role="alert") when login fails — then navigate
  // back to where the user came from.
  return <h1>Log in</h1>;
}
