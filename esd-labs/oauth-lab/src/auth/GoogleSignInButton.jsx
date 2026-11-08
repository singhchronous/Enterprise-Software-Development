// GoogleSignInButton — Google's "Sign in with Google" button as a React component (sections 07–08).
//
//   <GoogleSignInButton clientId={clientId} onCredential={(credential) => …} />
//
// Google Identity Services (GIS) draws the button itself, into a DOM element you hand it.
// React only hands out its DOM elements through a ref — useRef's first job. When someone
// signs in, GIS calls the callback you gave initialize() with { credential }: the Google ID
// token, a JWT string. This component passes that string, and only that, to onCredential.
//
// What it must get right (test/google-button.test.jsx):
//   - wait for Google's script (loadGoogle), and draw nothing if it unmounted meanwhile;
//   - draw exactly ONE button — also under StrictMode, which runs every effect twice in
//     development (mount, clean up, mount) — and redraw only when clientId changes;
//   - call the LATEST onCredential, without redrawing the button when the parent re-renders;
//   - if the script can't load, say so (role="alert").
import { useEffect, useRef, useState } from "react";
import { loadGoogle } from "./loadGoogle.js";

// How Google draws the button (the GIS reference lists every option).
const BUTTON = { type: "standard", theme: "outline", size: "large", text: "signin_with", shape: "rectangular" };

export function GoogleSignInButton({ clientId, onCredential, oneTap = false }) {
  // GIVEN (section 07): the latest onCredential, in a box that survives re-renders.
  // GIS keeps the callback you give initialize() and calls it later — maybe many renders
  // later. Handing it onCredential itself would freeze the one from that render (a stale
  // closure). So GIS gets a small arrow function that looks in this box when it's called,
  // and this effect (no dependency array: after every render) keeps the box up to date.
  const onCredentialRef = useRef(onCredential);
  useEffect(() => {
    onCredentialRef.current = onCredential;
  });

  // TODO (section 08): a <div> for GIS to draw into (useRef), and an effect that waits for
  // loadGoogle(), then calls initialize({ client_id, callback }) and renderButton(div, BUTTON).
  // Clean up, so StrictMode's second run can't leave two buttons. Until then, a placeholder:
  return <p className="muted small">TODO: the Google button (section 08)</p>;
}
