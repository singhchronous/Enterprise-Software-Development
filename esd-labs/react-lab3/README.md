# ESD — React Lab 3: Routing, screens and logging in

Pre-lab exercises for React Lab 3. The full walkthrough is the lab doc:
**https://esd-ta-sessions.vercel.app/react-lab3.html** — read it alongside this folder.

**AI-assisted, in one place only.** The pre-lab is manual: type the code yourself. The
in-lab task (`inlab/`) is done with AI, in the lab session.

## Setup (once)

```bash
cd esd-labs
git pull          # react-lab3 appears next to the other labs
cd react-lab3
npm install       # React, React Router, Vite, Vitest — once
npm run carry -- ../react-lab2   # step 0: bring YOUR React Lab 2 Courses page (below)
npm test          # at first most tests fail
npm run dev       # the app + the mock course API → http://localhost:5173
```

Node.js 20.19 or newer. Log in with `student@esd.local` / `student12345` or
`admin@esd.local` / `admin12345`. Every restart of `npm run dev` starts the mock API fresh.

## Step 0 — bring your React Lab 2 answers

This starter doesn't contain React Lab 2's answers: the four files of the lab-day Courses
page are Lab 2's stubs. `npm run carry -- ../react-lab2` copies **yours** over them:
`src/courses/useCourses.js`, `CoursesView.jsx`, `AddCourseForm.jsx` and `CoursesPage.jsx`
(whatever it replaces is kept in `.carry-backup/`). Nothing to merge by hand. It worked
when `npm run dev` lists the twenty courses on the home page again. If it says a file
still throws "TODO", that part of your Lab 2 isn't finished. The in-lab task reuses your
`AddCourseForm`, and its test finds the form's message by `role="alert"` (Lab 2, section
13): carry warns if that's missing.

This lab then makes three small changes to those files — the doc says when: section 06
(each course's name becomes a link), section 09 (`useCourses` sends the token), section
15 (the add form moves to the admin page).

**If your Lab 2 isn't finished, ask your TA** — the solution may be handed out later, and
`npm run carry -- <that folder>` works from it too.

## Core and stretch

**Core** is mandatory: it's what we go through in the lab, and `npm test` checks it.
**Stretch** is extra: `npm run test:stretch` checks it. Ask about either, any time.

```bash
npm test                         # core tests — get these all green
npx vitest run test/auth.test.jsx   # one file
npm run test:stretch             # stretch tests
npm run inlab                    # the in-lab task (in the lab session)
npm run test:all                 # everything
```

## Work section by section (all core unless marked)

| Doc section | Files you edit | Tests |
| --- | --- | --- |
| 04–05 Routes, layout, 404 | `src/App.jsx`, `src/pages/Layout.jsx`, `src/pages/NotFound.jsx` | `test/routes.test.jsx` |
| 05 — stretch: active links | `src/pages/Layout.jsx` | `test/stretch/navlink.test.jsx` |
| 06 The course page | `src/courses/CoursesView.jsx` (yours, from Lab 2), `src/courses/useCourse.js`, `src/courses/CourseDetail.jsx` | `test/detail.test.jsx` |
| 09 The token | `src/courses/useCourses.js` (yours, from Lab 2) | `inlab/admin.test.jsx` |
| 10 Logging in, the role badge | `src/auth/AuthContext.jsx`, `src/pages/LoginPage.jsx`, `src/pages/Layout.jsx` | `test/auth.test.jsx`, `test/badge.test.jsx` |
| 10 Survive a reload (`sessionStorage`) | `src/auth/AuthContext.jsx` | `test/session.test.jsx` |
| 11 Protected routes | `src/auth/RequireAuth.jsx` | `test/protected.test.jsx` |
| 11 Log in from anywhere | `src/pages/Layout.jsx` | `test/from-anywhere.test.jsx` |
| 12 My courses | `src/me/useMyEnrollments.js`, `src/me/MyCoursesPage.jsx` | `test/my-courses.test.jsx` |
| 13 Enrolling | `src/courses/useCourse.js`, `src/courses/CourseDetail.jsx` | `test/enroll.test.jsx` |
| 15 In the lab (AI) | `src/auth/RequireRole.jsx`, `src/admin/NewCoursePage.jsx`, `App.jsx`, `Layout.jsx`, `src/courses/CoursesPage.jsx` | `inlab/admin.test.jsx` |

Yours, from React Lab 2 (step 0): `src/courses/useCourses.js`, `CoursesView.jsx`,
`AddCourseForm.jsx`, `CoursesPage.jsx`. Given: `src/api/client.js` (Lab 2's, with the one
change section 09 explains), `src/main.jsx`, `src/styles.css`, `test/support/`, and `mock/`
(the mock API — never edit it).

## Rules

- **Don't change the tests** (or `test/support/`). Fix your code until they pass.
- The tests use the real mock API, in memory: each test starts from the seed data.
- `inlab/` is for the lab session itself. Leave it until then.

## Done means

`npm test` and `npm run inlab` are green, `inlab/PROMPTS.md` is filled in, and the app
does the walk-through in section 13 of the doc in the browser. Stretch is a bonus.
Submit by the end of the day of the lab: the next lab starts from this one (its `npm run
carry` brings your code over), and this lab's solution may be handed out after the deadline,
so late submissions can't be accepted. Section 18 has the steps.
