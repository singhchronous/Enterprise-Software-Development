// The "Or use your Google account" box on the login page (section 10). NEW in this lab.
//
//   <GoogleLoginBox />      the login page renders it next to its password form
//
// A second way in, the same way out: Google's button hands this box a credential (Google's ID
// token), loginWithGoogle(credential) swaps it for a session in AuthContext (section 09), and
// the box sends the user back where they were going (location.state.from), or to "/" — exactly
// what the password form does after login(). If the backend refuses the token, the box shows
// the error's message (role="alert"), and nobody is logged in.
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../auth/AuthContext.jsx";
import { GoogleSignInButton } from "../auth/GoogleSignInButton.jsx";
import { decodeJwtPayload } from "../auth/decodeJwt.js";

export function GoogleLoginBox() {
  const { loginWithGoogle } = useAuth();
  // The course's Google client ID: public, shipped in .env (section 06). Empty = not set up.
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [error, setError] = useState(null); // the ApiError (or NetworkError) from the last try

  // TODO (section 10): handleGoogle(credential) — your login page's submit handler, for
  // Google: clear the error, await loginWithGoogle(credential), then go back to where the
  // user was going, exactly as your login page does after login() (useNavigate, useLocation).
  // If it throws, keep the error, so the box shows its message.

  return (
    <div className="login-google">
      <h2>Or use your Google account</h2>
      {/* TODO (section 10): <GoogleSignInButton clientId={clientId} onCredential={…} /> —
          or, when clientId is empty, a note that says "Google sign-in isn't set up". */}
      {error && <p role="alert" className="error">{error.message}</p>}
    </div>
  );
}

