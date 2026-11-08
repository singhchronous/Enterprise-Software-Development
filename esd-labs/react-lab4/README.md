# ESD — React Lab 4: Integration — your own backend, end to end

Pre-lab exercises for React Lab 4. The full walkthrough is the lab doc:
**https://esd-ta-sessions.vercel.app/react-lab4.html** — read it alongside this folder.

This lab continues **your own React Lab 3 app** — step 0 below brings it over. You harden
it against the mock first (sections 03–08), then point it at **your own Spring Boot
backend**, add CORS there, and check the whole thing end to end (sections 09–13).

**AI-assisted, in one place only.** The React exercises in the pre-lab are manual: type them
yourself. The in-lab task (`inlab/`) is done with AI, in the lab session. Your backend is your
own code, as in the `api-contract` pack.

## Setup (once)

```bash
cd esd-labs
git pull          # react-lab4 appears next to the other labs
cd react-lab4
npm install       # once
npm run carry -- ../react-lab3   # step 0: bring YOUR React Lab 3 app (below)
npm test          # at first most tests fail
npm run dev       # the app + the mock course API → http://localhost:5173
```

Node.js 20.19 or newer. Log in with `student@esd.local` / `student12345`,
`riya@esd.local` / `riya12345` or `admin@esd.local` / `admin12345`.
Every restart of `npm run dev` starts the mock API fresh — and invalidates every token it
issued before, which section 04 uses on purpose.

## Step 0 — bring your React Lab 3 answers

This starter doesn't contain React Lab 3's (or Lab 2's) answers: those files are their
stubs. `npm run carry -- ../react-lab3` copies **yours** over them — 15 files: `src/App.jsx`,
`src/admin/NewCoursePage.jsx`, `src/auth/RequireAuth.jsx`, `src/auth/RequireRole.jsx`,
`src/courses/` (all six), `src/me/` (both) and `src/pages/` `Layout`, `LoginPage`,
`NotFound` (whatever it replaces is kept in `.carry-backup/`).

**One file by hand:** `src/auth/AuthContext.jsx` — both labs write parts of it, so carry
leaves it alone. Open it here and in `../react-lab3/src/auth/AuthContext.jsx`, and copy into
the four TODOs marked "from React Lab 3", in order: `KEY` and `loadSession()` (Lab 3's
sessionStorage); the first part of `AuthProvider` — its state, the `sessionStorage` effect,
`login()` and `logout()`; its context value and `return`; the body of `useAuth()`. (Section
01 of the doc walks through it.)

It worked when `npm run dev` is your Lab 3 app again — log in, enroll, My courses, log out —
and `npm test` says `27 failed | 7 passed (34)`: the 7 are things your Lab 3 app already does
right. If carry says a file still throws "TODO", that part of your Lab 3 isn't finished.

Sections 05–08 then change several of those files; each section names them.

**If your Lab 3 isn't finished, ask your TA** — the solution may be handed out later, and
`npm run carry -- <that folder>` works from it too.

**Aim to have your backend at conformance level C before the lab** (the `api-contract` pack:
`npm run conformance` in `esd-labs/api-contract`). It's graded as its own part — see
"Done means" below.

## Your own backend instead of the mock (section 09)

Create a file called `.env.local` in this folder (next to `package.json`) with one line:

```
VITE_API_URL=http://localhost:8080
```

then stop and restart `npm run dev`. The footer under every page (`src/main.jsx`) says which
API the app is using. Delete the file (and restart) to go back to the mock.

## Core and stretch

**Core** is mandatory: it's what we go through in the lab, and `npm test` checks it.
**Stretch** is extra: `npm run test:stretch` checks it. Ask about either, any time.

```bash
npm test                              # core tests — get these all green
npx vitest run test/expiry.test.jsx   # one file
npm run test:stretch                  # stretch tests
npm run inlab                         # the in-lab task (in the lab session)
npm run test:all                      # everything
```

## Work section by section (all core unless marked)

| Doc section | Files you edit | Tests |
| --- | --- | --- |
| 03 No answer at all | `src/api/client.js` | `test/client.test.jsx` |
| 05 One place for 401 | `src/api/client.js`, `src/auth/AuthContext.jsx` | `test/client.test.jsx`, `test/expiry.test.jsx` |
| 06 Every logged-in call through `api` | `src/courses/useCourses.js`, `src/courses/useCourse.js`, `src/me/useMyEnrollments.js`, `src/pages/LoginPage.jsx` | `test/expiry.test.jsx` |
| 07 Signing up — `fieldErrors` | `src/auth/AuthContext.jsx`, `src/pages/SignupPage.jsx`, `src/pages/LoginPage.jsx`, `src/App.jsx` | `test/signup.test.jsx` |
| 07 — stretch: login fieldErrors; clear on edit | `src/pages/LoginPage.jsx`, `src/pages/SignupPage.jsx` | `test/stretch/` |
| 08 Conflicts as states | `src/courses/CourseDetail.jsx`, `src/courses/useCourse.js` | `test/conflicts.test.jsx` |
| 09–13 Your backend, CORS, the gate, end to end | your Spring Boot project; `.env.local` | `conformance-report.txt` (section 12) |
| 15 In the lab (AI) | `AddCourseForm.jsx`, `useCourse.js`, `EditCoursePage.jsx`, `CourseDetail.jsx`, `App.jsx` | `inlab/edit-course.test.jsx` |

Everything in `src/` except `api/client.js`, `pages/SignupPage.jsx` and
`admin/EditCoursePage.jsx` is your own code from Labs 2–3 (step 0) — the sections above
change some of it. Given: `src/api/client.js` (Lab 3's, with this lab's exercises in it),
`src/main.jsx`, `src/styles.css`, `test/support/`, and `mock/` (the mock API — never edit it).

## Rules

- **Don't change the tests** (or `test/support/`). Fix your code until they pass.
- The tests use the real mock API, in memory: each test starts from the seed data. They
  never call your backend — `npm test` works with or without `.env.local`.
- `inlab/` is for the lab session itself. Leave it until then.

## Done means

Two parts, graded separately.

- **Frontend** (complete means complete): `npm test` and `npm run inlab` green — they run
  against the mock, so this never depends on your backend — and `inlab/PROMPTS.md` filled in.
- **Backend**: `conformance-report.txt` (your backend at level C, CORS included) in this folder.

If your backend isn't there yet, submit the frontend part anyway: the missing backend part
costs only its own marks, and you can still use the mock for everything in the lab.
Stretch is a bonus. Submit by the end of the day of the lab: the next lab starts from this
one (its `npm run carry` brings your code over), and this lab's solution may be handed out
after the deadline, so late submissions can't be accepted. Section 18 of the doc has the steps.
