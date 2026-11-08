// Who is logged in, shared with every component through context — yours, from React Labs 3–4
// (react-lab3.html §08–10, react-lab4.html §05–07) — plus ONE new function for this lab:
// loginWithGoogle (section 09).
//
// Both labs write parts of this file, so `npm run carry` doesn't copy it. Copy YOUR parts by
// hand from ../react-lab4/src/auth/AuthContext.jsx into the four TODOs marked "from React Lab 4"
// (section 01) — then this lab's TODO.
//
//   <AuthProvider> … </AuthProvider>              wraps the routes (App.jsx), inside the router
//   const { user, token, expired, login, loginWithGoogle, signup, logout, api } = useAuth();
//
//   user     null, or the logged-in user from GET /api/users/me: { id, email, fullName, role, createdAt }
//   token    null, or OUR API's JWT — from POST /api/auth/login or POST /api/auth/google
//   expired  true when the last session ended with a 401 (the login page says so)
//   login(email, password)              POST /api/auth/login, then GET /api/users/me, then store both.
//                                       Throws the ApiError (401 "Invalid email or password") on failure.
//   loginWithGoogle(credential)         The same, for Google: POST /api/auth/google with
//                                       { idToken: credential } (the string GIS gave the button), then
//                                       GET /api/users/me, then store both. Throws the ApiError (401 when
//                                       the backend refuses the Google token) and changes nothing.
//   signup({ email, password, fullName })  POST /api/auth/signup, then login(email, password).
//                                       Throws the ApiError (400 with fieldErrors, 409) on failure.
//   logout()                            POST /api/auth/logout (the server revokes the token), then
//                                       forget the session — even if that call fails.
//   api(path, { method, body })         apiFetch as the logged-in user: the token is added for you,
//                                       and a 401 sends the user to /login ("Your session has expired").
import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { apiFetch } from "../api/client.js";

const AuthContext = createContext(null);

// TODO — from React Lab 4 (React Lab 3's sessionStorage, §10): copy what keeping the
// session in sessionStorage needs from outside AuthProvider here — the key, and how you read
// the saved session. (A Google session must survive a reload too: a test checks it.)

export function AuthProvider({ children }) {
  // TODO — from React Lab 4: YOUR AuthProvider, from its first line down to the end of
  // signup() — everything before the context value: its state, login(), logout(),
  // sessionExpired(), api() and signup().

  // TODO (section 09): the same steps as your login(), with a different first request —
  // POST /api/auth/google with { idToken: credential }. Same answer, same session; and,
  // like login(), it clears `expired`. Then add it to the context value below.
  async function loginWithGoogle(credential) {
    throw new Error("TODO: loginWithGoogle (section 09)");
  }

  // TODO — from React Lab 4: YOUR context value and the return that provides it.
  // Then section 09 adds loginWithGoogle to the value.
  return children;
}

export function useAuth() {
  // TODO — from React Lab 4: YOUR useAuth() body. Until then, nobody is ever logged in.
  const todo = async () => { throw new Error("TODO — from React Lab 4: copy your AuthContext in (section 01)"); };
  return { user: null, token: null, expired: false, login: todo, loginWithGoogle: todo, signup: todo, logout: async () => {}, api: todo };
}
