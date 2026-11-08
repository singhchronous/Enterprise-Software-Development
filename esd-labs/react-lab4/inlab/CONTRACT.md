# In-lab task — edit and delete a course (ADMIN)

For the lab session (section 15 of the doc). **AI-assisted:** you give an AI this contract,
the constraint prompt below and the files it names, then you judge what comes back.
Checked by `npm run inlab`. Keep your prompts and your judgement in `inlab/PROMPTS.md`.

Start only when `npm test` is green — this uses `useAuth().api` (section 05) and the course
page from section 08.

## What already exists (attach these to your prompt)

| File | What it gives you |
| --- | --- |
| `src/courses/AddCourseForm.jsx` | `<AddCourseForm onAdd={fn} />` — the course form from Lab 2: controlled fields, `fieldErrors` under each field (its input `aria-describedby` the message), the error's message in a `role="alert"`. Calls `await onAdd(draft)`; shows whatever `onAdd` throws. |
| `src/courses/useCourse.js` | Yours, from Lab 3, with sections 06 and 08 done: `useCourse(id)` → `{ course, status, error, enroll }`, and `useAuth().api` already in it. `update` and `remove` don't exist yet: you add them, and return them too. |
| `src/admin/NewCoursePage.jsx` | The pattern: a page that saves through a hook and lets the form show errors. |
| `src/admin/EditCoursePage.jsx` | The page you write (a TODO now). |
| `src/courses/CourseDetail.jsx` | The course page. |
| `src/App.jsx` | The route table. |
| `src/auth/AuthContext.jsx` | `useAuth()` → `{ user, api, … }`. `api(path, { method, body })` sends the token and handles a 401. |

## What to build

1. **`src/courses/AddCourseForm.jsx`** — reuse it for editing. Three new **optional** props:
   - `initial` — a Course from the API. When given, the fields start with its values
     (numbers as strings, a `null` description as `""`). Start the state from it with
     `useState`'s initial value — **not** a `useEffect` that copies props into state.
   - `heading` — the form's `<h2>`, default `"Add a course"`.
   - `submitLabel` — the button's text, default `"Add course"`.

   With none of them, the form behaves **exactly** as before — the New course page must
   not change. Keep the prop name `onAdd`. After a successful save, only an add form
   empties itself; an edit form keeps its values.
2. **`src/courses/useCourse.js`** — two functions, both through `api`:
   - `update(courseRequest)` → `PUT /api/courses/{id}` with the whole course; keep the
     answer in `course`; return it. Don't catch errors.
   - `remove()` → `DELETE /api/courses/{id}`. Don't catch errors.
3. **`src/admin/EditCoursePage.jsx`** — named export (`export function EditCoursePage()`), at `/admin/courses/:id/edit`.
   - While the course loads, "Loading course…". If it fails, the error's message.
   - A heading **"Edit &lt;code&gt;"** (e.g. "Edit CS402"), then
     `<AddCourseForm initial={course} heading="Course details" submitLabel="Save changes" onAdd={…} />`.
     `onAdd` calls `update(draft)`, then navigates to `/courses/<id>`. Don't catch the
     error in the page — let it reach the form, which shows it.
   - A **"Delete course"** button. It asks first with
     `window.confirm("Delete CS402? Its enrollments are deleted too.")`; on OK it calls
     `remove()` and navigates to `/`. If `remove()` throws, show its message (`role="alert"`).
4. **`src/courses/CourseDetail.jsx`** — an **"Edit course"** link to `/admin/courses/<id>/edit`,
   next to the Enroll button, shown only when `user.role === "ADMIN"`.
5. **`src/App.jsx`** — the route `admin/courses/:id/edit` inside the `Layout` route, with the
   element `<RequireRole role="ADMIN"><EditCoursePage /></RequireRole>`.

## The API (from the contract, `openapi.yaml`)

```
PUT    /api/courses/{id}     ADMIN only     Authorization: Bearer <token>
  body  { code, title, description?, department, credits, capacity }   — the WHOLE course
  200   the updated Course
  400   "Validation failed", fieldErrors: { code: "must be …", … }
  401   (expired / logged-out token — api handles it)
  403   "Access denied"                       (not an ADMIN)
  404   no course with that id
  409   "Course code already exists"  |  "Capacity is below current enrollments"

DELETE /api/courses/{id}     ADMIN only     Authorization: Bearer <token>
  204   deleted — and its enrollments with it
  401, 403, 404 as above
```

## The constraint prompt (paste it, unchanged, before your request)

> You are helping a student in a React lab. Use only what the lab has taught: React's
> `useState`, `useEffect`, custom hooks, context (`createContext`/`useContext`), and React
> Router 7 (`react-router` package, library mode). Do **not** use `useMemo`, `useCallback`,
> `useReducer` or `useRef`. Do not add any library or package. JavaScript with JSX, no
> TypeScript. Do not call `fetch` or `apiFetch` directly — every request goes through
> `useAuth().api`, inside the `useCourse` hook. Reuse `AddCourseForm`; do not write a second
> form. Do not copy props into state with `useEffect`. Change only the five files named in
> the contract, and show each one in full.

## Done means

- `npm run inlab` is green, and `npm test` is still green.
- As the admin: edit CS402's capacity, land on its page with the new numbers. Try a
  capacity below its enrollments: the form shows the server's 409. Delete a course you made.
- As the student: no "Edit course" link, and the edit URL says "You don't have access".
- You can say what every line the AI wrote does — or you deleted it.
- `inlab/PROMPTS.md` is filled in.
