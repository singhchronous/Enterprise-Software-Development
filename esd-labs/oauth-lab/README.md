# ESD — OAuth2 lab: Sign in with Google, end to end

The lab doc is the walkthrough: **https://esd-ta-sessions.vercel.app/oauth-lab.html** —
read it alongside this folder.

**AI-assisted, in one place.** The pre-lab (the React part, sections 01–12) is manual: type it
yourself. The in-lab task — Google sign-in in **your own Spring Boot backend** (`inlab/`) — is
done with AI, under a constraint prompt, and audited.

## Setup (once)

```bash
cd esd-labs
git pull          # oauth-lab appears next to the other labs
cd oauth-lab
npm install       # React, React Router, Vite, Vitest — once
npm run carry -- ../react-lab4   # step 0: bring YOUR React Lab 4 app (below)
npm test          # at first most tests fail
npm run dev       # the app + the mock course API → http://localhost:5173
```

Node.js 20.19 or newer. Open the app at **http://localhost:5173** exactly — not `127.0.0.1`,
not another port: Google only accepts the origins the course's client ID lists.

`.env` already holds the course's Google client ID (`VITE_GOOGLE_CLIENT_ID`). It's public, and
you don't edit it. Your own settings go in `.env.local` (never committed) — in section 15,
`VITE_API_URL=http://localhost:8080` to use your own backend.

## Step 0 — bring your React Lab 4 answers

This starter doesn't contain the answers of React Labs 2–4: those files are their stubs.
`npm run carry -- ../react-lab4` copies **yours** over them — 18 files: `src/App.jsx`,
`src/admin/` (both), `src/api/client.js`, `src/auth/RequireAuth.jsx` and `RequireRole.jsx`,
`src/courses/` (all six), `src/me/` (both) and `src/pages/` `Layout`, `LoginPage`, `NotFound`,
`SignupPage` (whatever it replaces is kept in `.carry-backup/`).

**One file by hand:** `src/auth/AuthContext.jsx` — this lab adds `loginWithGoogle` to it, so
carry leaves it alone. Open it here and in `../react-lab4/src/auth/AuthContext.jsx`, and copy
into the four TODOs marked "from React Lab 4", in order: `KEY` and `loadSession()`;
`AuthProvider` from its first line down to (not including) the context value; the context
value and `return`; the body of `useAuth()`. (Section 01 of the doc walks through it.)

It worked when `npm run dev` is your React Lab 4 app again (log in with a password, enroll,
log out) and `npm test` says `17 failed | 14 passed (31)` — the 14 are
`test/google-verify.test.js`; the 17 are this lab's work. If carry says a file still throws
"TODO", that part of your Lab 4 isn't finished.

**If your Lab 4 isn't finished, ask your TA** — the solution may be handed out later, and
`npm run carry -- <that folder>` works from it too.

## Core and stretch

```bash
npm test                                  # core tests — get these all green
npx vitest run test/google-button.test.jsx   # one file
npm run test:stretch                      # stretch tests
npm run test:all                          # everything
```

## Work section by section (all core unless marked)

| Doc section | Files you edit | Tests |
| --- | --- | --- |
| 05 Who checks what | — (read the test) | `test/google-verify.test.js` (passes from the start) |
| 08 The Google button | `src/auth/GoogleSignInButton.jsx` | `test/google-button.test.jsx` |
| 09 loginWithGoogle | `src/auth/AuthContext.jsx` | `test/google-login.test.jsx` |
| 10 The login page | `src/pages/GoogleLoginBox.jsx`, and one line in `src/pages/LoginPage.jsx` (yours) | `test/google-login.test.jsx` |
| 10 — stretch: decode for display | `src/auth/decodeJwt.js`, `src/pages/GoogleLoginBox.jsx` | `test/stretch/decode.test.js`, `test/stretch/signing-in-as.test.jsx` |
| 10 — stretch: One Tap | `src/auth/GoogleSignInButton.jsx`, `src/pages/GoogleLoginBox.jsx` | `test/stretch/one-tap.test.jsx` |
| 11–15 Your backend, in the lab (AI) | your Spring Boot project | `npm run conformance -- --level D` (in `api-contract`), and a real sign-in |

Yours, from React Labs 2–4 (step 0): routing, `AuthContext`'s `login`/`signup`/`logout`/`api`
and the "session expired" flow, `RequireAuth`, `RequireRole`, signup, the course and admin
pages, `src/api/client.js`. Given: `src/auth/loadGoogle.js` (loads Google's script — section
06), `src/main.jsx`, `src/styles.css`, `test/support/` (a pretend Google for the tests), and
`mock/` (the mock API — never edit it).

## Rules

- **Don't change the tests** (or `test/support/`). Fix your code until they pass.
- The tests never talk to Google: `test/support/google.js` signs tokens with its own key and
  plays Google's part. A real sign-in is the last check, in the browser (sections 10 and 15).
- `inlab/` is for the lab session. Read `inlab/BACKEND.md` before the lab; do it in the lab.

## Done means

Two parts, graded separately.

- **Frontend** (complete means complete): `npm test` green — it runs against the mock, so
  this never depends on your backend.
- **Backend**: your backend passes `npm run conformance -- --level D` (`inlab/conformance.txt`);
  a real Google sign-in works against your own backend (`inlab/signed-in.png`); the backend
  files you changed in `inlab/backend/`; `inlab/AUDIT.md` filled in.

If your backend isn't there yet, submit the frontend part anyway: the missing backend part
costs only its own marks, and you can still use the mock for everything in the lab.
Submit before the deadline announced for this lab — section 18 of the doc has the steps.
