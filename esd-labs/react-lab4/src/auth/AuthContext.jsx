// Who is logged in, shared with every component through context — React Lab 3's (§08–10), with
// THREE ADDITIONS for this lab, all yours:
//   api           the one door for logged-in requests; a 401 there ends the session  (section 05)
//   expired       true after the session ended that way, until the next login       (section 05)
//   signup(…)     create an account, then log straight in                           (section 07)
//
// Both labs write parts of this file, so `npm run carry` doesn't copy it. Copy YOUR parts by
// hand from ../react-lab3/src/auth/AuthContext.jsx into the four TODOs marked "from React Lab 3"
// (section 01) — then this lab's TODOs.
//
//   <AuthProvider> … </AuthProvider>              wraps the routes (App.jsx), inside the router
//   const { user, token, expired, login, signup, logout, api } = useAuth();
//
//   user     null, or the logged-in user from GET /api/users/me: { id, email, fullName, role, createdAt }
//   token    null, or the JWT from POST /api/auth/login
//   expired  true when the last session ended with a 401 (the login page says so)
//   login(email, password)              POST /api/auth/login, then GET /api/users/me, then store both.
//                                       Throws the ApiError (401 "Invalid email or password") on failure.
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

// TODO — from React Lab 3 (§10, step 4): what keeping the session in sessionStorage needs
// from outside AuthProvider — the key, and how you read the saved session. This lab's tests
// need it (test/expiry.test.jsx).

export function AuthProvider({ children }) {
  // TODO (section 05): an `expired` state (false to start). sessionExpired() also needs
  // useNavigate() and useLocation() — AuthProvider sits inside the router, so it can.
  // The placeholder below keeps the app running until you do; replace it.
  const expired = false;

  // TODO — from React Lab 3 (§10): YOUR AuthProvider's first part — its state, the
  // sessionStorage effect, login() and logout().
  // Then section 05 adds one line to login(): clear `expired` once the new session is stored.

  // TODO (section 05): sessionExpired() — navigate to /login (replace, with { from: location }
  // in the state), then forget the session and set `expired` — and api(path, options), which
  // calls apiFetch with the logged-in user's token and onUnauthorized: sessionExpired filled in.
  // The placeholder below keeps the app running until you do; replace it.
  function api() {
    throw new Error("TODO: api (section 05)");
  }

  async function signup({ email, password, fullName }) {
    // TODO (section 07): POST /api/auth/signup with { email, password, fullName } — then log
    // straight in with the same email and password. Don't catch anything: the page shows it.
    throw new Error("TODO: signup (section 07)");
  }

  // TODO — from React Lab 3 (§10): YOUR context value and the return that provides it.
  // Then put this lab's expired, signup and api in the value too (sections 05 and 07).
  return children;
}

export function useAuth() {
  // TODO — from React Lab 3 (§10): YOUR useAuth() body. Until then, nobody is ever logged in.
  const todo = async () => { throw new Error("TODO — from React Lab 3: copy your AuthContext in (section 01)"); };
  return { user: null, token: null, expired: false, login: todo, signup: todo, logout: async () => {}, api: todo };
}
