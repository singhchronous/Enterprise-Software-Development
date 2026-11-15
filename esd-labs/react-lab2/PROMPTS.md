# Prompt log — React Lab 2

Part of what you submit. It shows *how* you used AI: did you hand it the contract and the
rules, or type "make it work"? Fill it in **as you go**, not from memory at the end.

- Name and roll number: Shubham Singh, MT2026121
- AI tool and plan (e.g. ChatGPT free, Gemini, Claude free, Copilot): Claude free (claude.ai), one new chat

**Log every prompt you send, in order — including the ones that didn't help.** Paste each
prompt in full. One exception: if you pasted CONTRACT.md's prompt 1 unchanged, write
"CONTRACT.md prompt 1, unchanged". Summarise each reply; don't paste whole files.

---

## Prompt 1 — generate

**Sent:**

```text
CONTRACT.md prompt 1, unchanged
```

**What came back:** (which files; which hooks it used; anything from the "not yet" list;
anything it did that the contract didn't ask for)

Four files: `courseFormat.js` (helpers: the field list, the empty form, seats text,
sorting by code, building the CourseRequest), `useCourses.js` (one hook holding the list,
the load error, the form's values, `submitting` and the submit error; one `useEffect`
with an `ignore` cleanup), `CoursesView.jsx` (renders the list AND the form, with two
inner components, `CourseList` and `Field`), and `CoursesPage.jsx`. Only `useState` and
`useEffect`; nothing from the "not yet" list; only `apiFetch`. Not asked for: a separate
helpers module, `noValidate` on the form, and empty Credits/Capacity sent as `null`
instead of a number. No `AddCourseForm`, and no single `status` field.

**Did it run?** (`npm run dev`: list loads? add works? 409 shown? fieldErrors shown?
`npm test`: __ passed / __ failed)

Yes: the list loads (20 courses, CS201 "Full"); CS350 appears between CS305 and CS402 and
the form clears; CS501 shows "Course code already exists" and keeps what was typed;
`cs350` with credits `9` shows "Validation failed" and the reasons under Code and Credits.
`npm test`: 31 passed / 31 failed (useCourses, AddCourseForm, CoursesView, fieldErrors).

**What I did with it:** put the files in `src/courses/`, ran it and the tests, then
asked for the fix in prompt 2 with CONTRACT.md §4 as the target. The full audit of this
version is in AUDIT.md.

---

## Prompt 2 — fix to the §4 shape

**Why I sent it:** (for a fix prompt: which decision in AUDIT.md it carries out)

To get the four files into the CONTRACT.md §4 shape (pasted in as the target): one
`status` field, an `ignore` cleanup, `CoursesView` taking only `{ courses, status, error }`,
and accessible field errors in `AddCourseForm`. Two of the decisions I listed turned out
not to apply to this version (see "What came back").

**Sent:**

```text
Here is my audit of your code. Please change it to carry out these decisions, and match the shape below exactly.

Decisions:
- Cut the loading boolean. Use one status field: "loading" | "ready" | "error", with error holding the message (a string) only when status is "error".
- Add an ignore flag to the effect in useCourses, set to true in its cleanup, so a stale answer is dropped.
- CoursesView takes { courses, status, error }.
- In AddCourseForm: an input with a fieldErrors entry gets aria-invalid="true" and aria-describedby pointing at its message's id; the message above the button gets role="alert".
- Don't add anything else, and don't use any hook other than useState and useEffect.

Target shape:
Four files in src/courses/, named exports, exactly these names and props. Nothing else is
needed, and anything else has to earn its place (AUDIT.md, "the rule").

### src/courses/useCourses.js — the hook: fetch and logic

export function useCourses()  // → { courses, status, error, addCourse }
status is one field: "loading" | "ready" | "error" — not loading / error booleans.
error is the error's message (a string) when status is "error", otherwise null.
Loads GET /api/courses **once**, when the page appears: a useEffect with [], whose
cleanup sets an ignore flag so a stale answer is dropped.
addCourse(courseRequest): POSTs it with apiFetch; inserts the 201 body into courses,
sorted by code, as a **new** array (no reload of the list); resolves with the created
course. If apiFetch throws, addCourse throws the same ApiError — it doesn't catch
it; the form shows it.

### src/courses/CoursesView.jsx — the View: only renders

export function CoursesView({ courses, status, error })
Renders only: no fetch, no apiFetch, no hooks, no state.
"loading" → Loading courses… · "error" → Couldn't load courses: <error> ·
no courses → No courses yet. · otherwise a <ul> with one <li key={course.id}> per
course, **in the order it is given**, with the two lines from prompt 1, point 2.

### src/courses/AddCourseForm.jsx — the form: raises "add this course"

export function AddCourseForm({ onAdd })
Its own state: the six input values (controlled inputs, one <label> each: Code, Title,
Department, Credits, Capacity, Description — a textarea), whether it is submitting, and
the last error.
On submit: preventDefault(), then
await onAdd({ code, title, department, credits: Number(…), capacity: Number(…), description })
with description = the text, or null when empty. The "Add course" button is disabled
while waiting.
Success → clear the form and the error. Failure → keep what was typed; show
error.message above the button, and each error.fieldErrors entry directly under its
own input (not inside the <label>).
Errors a screen reader can find: an input with a fieldErrors entry has
aria-invalid="true" and aria-describedby set to its message's id; the message
above the button has role="alert".
Never calls apiFetch or fetch itself.

### src/courses/CoursesPage.jsx — puts them together

export function CoursesPage()
Calls useCourses(), and renders <h1>Courses</h1>,
<CoursesView courses={…} status={…} error={…} /> and <AddCourseForm onAdd={addCourse} />.
Nothing else.
```

**What came back:** four files matching §4: `useCourses.js` (`courses`, `status`,
`error`, `addCourse`; the `ignore` cleanup), `CoursesView.jsx` (renders only, from
`{ courses, status, error }`), `AddCourseForm.jsx` (its own values, `submitting` and
error; `Number(…)` for credits and capacity; `aria-invalid` / `aria-describedby` on fields
with an error; `role="alert"` on the message), and `CoursesPage.jsx` (h1 + View + form).
`courseFormat.js` is gone. The AI pointed out two things: the first version had no
`loading` boolean to cut (it used `courses === null`) and already had the `ignore` flag;
and `Number("")` sends an empty Credits field as 0, so the server says "out of range"
instead of "required". `npm test`: 62 passed / 0 failed; the four browser checks all pass.

**What I kept, and what I rejected:** kept all four files as they came back. Kept
`Number(…)` rather than switching back to `null`, because §4 asks for `Number(…)` and the
server still rejects the bad value. Deleted `courseFormat.js`, which nothing imports now.

---

<!-- Copy the "Prompt 2" block for each further prompt. -->

## Afterwards

- How many prompts did the whole feature take? Two: prompt 1 to generate, prompt 2 to fix.
- Which of your prompts would you write differently now, and how? Prompt 2: two of its
  decisions ("cut the loading boolean", "add an ignore flag") didn't match the first
  version, which had neither problem. I'd write each decision against the code that came
  back, with `file:line`, e.g. "move the form's state from useCourses.js:9–11 into a new
  AddCourseForm".
- One thing the rules in prompt 1 prevented (or failed to prevent): they kept out every
  "not yet" hook, but "one View component that only renders" didn't stop the AI putting
  the whole form, and its state, in that View and the data hook.
