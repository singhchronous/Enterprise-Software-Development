# Audit — React Lab 2

Part of what you submit. Fill in sections 0–4 **before** you ask the AI to change anything:
deciding what's wrong is your job, not the AI's. The sheet you audit against is "The Shape
of a Good React Slice" — section 08 of the lab doc.

Point at code as `file:line`, e.g. `CoursesPage.jsx:14`.

---

## 0. What came back

| File the AI gave you | What's in it (components, hooks) | Lines |
| --- | --- | --- |
| `src/courses/courseFormat.js` | no components or hooks: `COURSE_FIELDS`, `EMPTY_FORM`, `formatSeats`, `compareByCode`, `insertSorted`, `toCourseRequest` | 50 |
| `src/courses/useCourses.js` | custom hook `useCourses`: `useState` ×5 (courses, loadError, form, submitting, submitError), `useEffect` ×1, `handleChange`, `handleSubmit` | 62 |
| `src/courses/CoursesView.jsx` | components `CoursesView`, `CourseList`, `Field` — the list AND the whole form | 84 |
| `src/courses/CoursesPage.jsx` | component `CoursesPage`: calls `useCourses()`, passes everything to `CoursesView` | 17 |

No `AddCourseForm.jsx`: the form is inside `CoursesView.jsx`, so the placeholder stayed.

- Does it run? List loads / valid add appears in order / duplicate code shows the 409
  message / bad input shows fieldErrors under the inputs: yes / yes (CS350 between CS305
  and CS402, form cleared) / yes (typed values kept) / yes (reasons under Code and Credits)
- Requests in the Network tab — on page load: 2 × `GET /api/courses` (development
  StrictMode runs the effect twice; the `ignore` flag means only the second answer is
  used) ; per add: 1 × `POST /api/courses` (plus a one-time `POST /api/auth/login` before
  the first add, made by the given client)
- `npm test` before any fix: 31 passed / 31 failed. Which test files fail?
  `test/courses/useCourses.test.jsx` (10), `test/courses/AddCourseForm.test.jsx` (11),
  `test/courses/CoursesView.test.jsx` (8), `test/courses/fieldErrors.test.jsx` (2).
  `test/courses/CoursesPage.test.jsx` passes: the page works, but not in the §4 shape.

## 1. Part A — walk the allowed list

Is each element present, and in the right place?

| Element (the sheet, Part A) | Where it is in the AI's code (`file:line`, or "missing") | Right place? If not, where should it be? |
| --- | --- | --- |
| One View component that only renders | `CoursesView.jsx:47` | Only renders, but it renders the list **and** the form, and takes the form's state and handlers as props. The list should be its own View; the form its own component |
| Fetch + logic in a separate hook or module | `useCourses.js:5`, plus `courseFormat.js` | Yes, but the hook also holds the form's state and its submit handler (`useCourses.js:9–11`, `:32`) |
| `useState` for the course list, at the right level | `useCourses.js:6` | Yes |
| `useState` for the form's inputs, at the right level | `useCourses.js:9` | No — only the form needs them; they belong in `AddCourseForm` |
| `useEffect` — for the initial fetch only (with a cleanup) | `useCourses.js:13` (cleanup `:23`) | Yes — `[]` and an `ignore` flag |
| Props down, callbacks up (the form raises "add this course") | `CoursesPage.jsx:13–14` | No — the form passes the raw submit event up (`onSubmit={state.handleSubmit}`); it should call `onAdd(courseRequest)` |
| `.map` to render the list, with a stable `key` | `CoursesView.jsx:9–10`, `key={course.id}` | Yes |
| Loading / error / empty states, from one `status` | `CoursesView.jsx:4–5` (`loadError !== null`, `courses === null`) | No — worked out from two fields; should be one `status` from the hook |

## 2. Part B — scan for "not yet"

Search the files (VS Code: Ctrl/Cmd+Shift+F) for each one.

| Not yet | Found? (`file:line`) | What it does in *this* slice | Cut, or keep — and why |
| --- | --- | --- | --- |
| `useMemo` | not found | — | — |
| `useCallback` | not found | — | — |
| `useReducer` | not found | — | — |
| `useRef` | not found | — | — |
| Context (`createContext`, `useContext`) | not found | — | — |
| A data-fetching library, or `axios`, or raw `fetch` instead of `apiFetch` | not found — only `apiFetch` (`useCourses.js:15`, `:37`) | — | — |
| TypeScript (types, interfaces, `.ts`/`.tsx`) | not found | — | — |
| Anything else nobody taught you (name it) | `noValidate` on the form (`CoursesView.jsx:62`); `toNumberOrNull` (`courseFormat.js:37`) | `noValidate` stops the browser blocking a submit; `toNumberOrNull` sends an empty number field as `null` | Keep `noValidate` (prompt 1 says no browser validation). Cut `toNumberOrNull`: §4 says `Number(…)` |

## 3. The rule — every hook and every component split

One row for **each** `useState`, `useEffect` and custom hook call, and for **each**
component. Say what it does *in this slice*. "The AI added it" and "just in case" are not
answers — if you can't name its job, the decision is "cut".

| Hook call or component (`file:line`) | What earns it here? (one sentence) | Keep / cut / move (to where) |
| --- | --- | --- |
| `useCourses` (`useCourses.js:5`) | Keeps fetching and adding out of the components. | Keep, but only for the list: return `{ courses, status, error, addCourse }` |
| `useState` courses (`useCourses.js:6`) | The list changes after an add, so it has to be state. | Keep, start at `[]` instead of `null` |
| `useState` loadError (`useCourses.js:7`) | The message for "Couldn't load courses: …". | Keep as `error`, next to a new `status` |
| `useState` form (`useCourses.js:9`) | The six controlled inputs — only the form uses them. | Move → `AddCourseForm` |
| `useState` submitting (`useCourses.js:10`) | Disables the button until the server answers. | Move → `AddCourseForm` |
| `useState` submitError (`useCourses.js:11`) | The form's last error — only the form shows it. | Move → `AddCourseForm` |
| `useEffect` (`useCourses.js:13`) | Loads the list once, when the page appears. | Keep |
| `CoursesView` (`CoursesView.jsx:47`) | Should render the list states only. | Keep, take `{ courses, status, error }`; form out |
| `CourseList` (`CoursesView.jsx:3`) | Is the list part of the View. | Cut — becomes `CoursesView` itself |
| `Field` (`CoursesView.jsx:23`) | One labelled input with its error. | Cut — fold into `AddCourseForm` |
| `CoursesPage` (`CoursesPage.jsx:4`) | Calls the hook once and wires it up. | Keep: h1 + `CoursesView` + `AddCourseForm` |

## 4. Decisions — before any fix prompt

- I will **cut**: working out loading from `courses === null` — use one `status` field
  ("loading" | "ready" | "error") with `error` as the message; `CourseList` and `Field`;
  `courseFormat.js` and `toNumberOrNull`.
- I will **move** (from → to): the form's state, `handleChange` and `handleSubmit` —
  `useCourses.js` → a new `AddCourseForm.jsx` that calls `onAdd(courseRequest)`; the
  `<h1>` — `CoursesView` → `CoursesPage`.
- I will **add** (missing from the AI's version): `addCourse` in the hook (POST, insert the
  201 body in code order, return it, let errors through); `AddCourseForm.jsx`;
  `aria-invalid="true"` + `aria-describedby` on fields with an error, and `role="alert"` on
  the message above the button, inside `AddCourseForm`. Keep the `ignore` flag (already
  there).
- Other smells I found (state stored that could be computed, a reload after add, browser
  validation, `key={index}`, swallowed errors…): none of the listed ones — the add inserts
  the 201 body (no reload), keys are `course.id`, `noValidate` turns browser validation
  off, and errors reach the screen. The real problem is the split: one hook holding both
  the list and the form, and one View rendering both.

---

## 5. Strip check (section 14 of the doc)

For each "not yet" item you removed — one at a time:

| Removed | `npm test` after | The app after (loads / adds / shows errors) |
| --- | --- | --- |
| — (nothing to remove) | 62 passed / 0 failed | loads / adds in order / shows the 409 and fieldErrors |

If the AI used none, say so here, and say which rule in prompt 1 you think prevented it.

The AI used none, in either version. The rule "Use only useState and useEffect. Do not use
useMemo, useCallback, useReducer, useRef, or context" prevented them.

## 6. Before / after

|  | Before (the AI's first version) | After (yours) |
| --- | --- | --- |
| Files and components | 4 files: `courseFormat.js`, `useCourses.js`, `CoursesView.jsx` (`CoursesView`, `CourseList`, `Field`), `CoursesPage.jsx` | 4 files: `useCourses.js`, `CoursesView.jsx`, `AddCourseForm.jsx`, `CoursesPage.jsx` — one component each |
| `useState` calls (and where) | 5, all in `useCourses` (courses, loadError, form, submitting, submitError) | 6: courses, status, error (`useCourses`); values, submitting, error (`AddCourseForm`) |
| `useEffect` calls | 1 (`useCourses`), with cleanup | 1 (`useCourses`), with cleanup |
| "Not yet" items | none | none |
| Requests: on load / per add | 2 (development StrictMode) / 1 | 2 (development StrictMode) / 1 |
| `npm test` | 31 passed / 31 failed | 62 passed / 0 failed |

## 7. Two sentences

- One thing the AI got right that you might not have thought of: it put the `ignore`
  flag in the effect's cleanup without being asked, and it noticed that `Number("")` turns
  an empty Credits field into 0, so the server reports the wrong problem.
- One thing you will never accept from an AI without checking again: "it works" — the
  first version passed every end-to-end check, but kept the form's state in the data hook
  and failed half the tests on shape.
