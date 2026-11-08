// From React Lab 4 (and before). `npm run carry -- ../react-lab4` copies YOUR SignupPage.jsx over this
// file (section 01). This lab doesn't change it.
//
// /signup — create an account, then log straight in (React Lab 4 · §07).
//
// A controlled form like the login page, but this time the server's `fieldErrors` matter:
// a 400 says which fields are wrong, and each message goes under its own field. A 409 says
// the email is taken — not a problem with what you typed, so it gets the form's message,
// and a way forward (log in instead).
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext.jsx";

// The three fields share the same markup, so they're drawn from a list (like AddCourseForm).
const FIELDS = [
  { name: "fullName", label: "Full name", type: "text", autoComplete: "name" },
  { name: "email", label: "Email", type: "email", autoComplete: "username" },
  { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
];

export function SignupPage() {
  // TODO (React Lab 4 · §07): a "Create an account" heading and a controlled form — Full name,
  // Email and Password, a "Sign up" button. On submit: signup(…) from useAuth(), then back
  // to `from`. On a 400, each fieldErrors entry under its own field; any error's message
  // in a role="alert"; on a 409, a "Log in instead" link too.
  return <h1>Create an account</h1>;
}
