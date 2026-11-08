# In-lab task — an admin-only "New course" page

For the lab session (section 15 of the doc). **AI-assisted:** you give an AI this contract,
the constraint prompt below and the files it names, then you judge what comes back.
Checked by `npm run inlab`. Keep your prompts and your judgement in `inlab/PROMPTS.md`.

Start only when `npm test` is green — this builds on your routes, `AuthContext` and `RequireAuth`.

## What already exists (attach these to your prompt)

| File | What it gives you |
| --- | --- |
| `src/auth/AuthContext.jsx` | `useAuth()` → `{ user, token, login, logout }`. `user.role` is `"STUDENT"` or `"ADMIN"` (from `GET /api/users/me`). |
| `src/auth/RequireAuth.jsx` | The pattern to follow: no user → `<Navigate to="/login" replace state={{ from: location }} />`. |
| `src/courses/useCourses.js` | Yours, from Lab 2, with section 09's change: `useCourses().addCourse(draft)` → `POST /api/courses` **with the token**; returns the created course; throws an `ApiError` (400 with `fieldErrors`, 401, 403, 409). |
| `src/courses/AddCourseForm.jsx` | Yours, from Lab 2: `<AddCourseForm onAdd={fn} />` — calls `await onAdd(draft)` and shows any error `onAdd` throws. Reuse it unchanged. |
| `src/App.jsx` | The route table. |
| `src/pages/Layout.jsx` | The header and its links. |

## What to build

1. **`src/auth/RequireRole.jsx`** — named export (`export function RequireRole({ role, children })`).
   - Nobody logged in → `<Navigate to="/login" replace state={{ from: location }} />`, exactly like `RequireAuth`.
   - Logged in, but `user.role !== role` → render, **in place**, a heading **"You don't have access"**,
     one sentence saying who you are and what the page needs, and a link back to `/`.
     **Not** a redirect: this user is logged in, so sending them to `/login` would only bring them back.
   - Otherwise → `children` (or `<Outlet />` when there are none).
2. **`src/admin/NewCoursePage.jsx`** — named export (`export function NewCoursePage()`). A heading **"New course"** and
   `<AddCourseForm onAdd={…} />`. `onAdd` calls `useCourses().addCourse(draft)`, then navigates to
   `/courses/<the created course's id>`. Don't catch the error in the page — let it reach the form,
   which shows it.
3. **`src/App.jsx`** — a route `admin/courses/new` inside the `Layout` route, with the element
   `<RequireRole role="ADMIN"><NewCoursePage /></RequireRole>`.
4. **`src/pages/Layout.jsx`** — a **"New course"** link to `/admin/courses/new` in the header,
   shown only when `user.role === "ADMIN"`.

## The API (from the contract, `openapi.yaml`)

```
POST /api/courses            ADMIN only        Authorization: Bearer <token>
  body  { code, title, description?, department, credits, capacity }
  201   the created Course: { id, code, title, description, department, credits, capacity, seatsLeft }
  400   "Validation failed", fieldErrors: { code: "must be …", … }
  401   "Authentication required"   (no token, or a revoked/expired one)
  403   "Access denied"             (a valid token, but not an ADMIN)
  409   "Course code already exists"
```

## The constraint prompt (paste it, unchanged, before your request)

> You are helping a student in a React lab. Use only what the lab has taught: React's
> `useState`, `useEffect`, custom hooks, context (`createContext`/`useContext`), and React
> Router 7 (`react-router` package, library mode: `Routes`, `Route`, `Link`, `NavLink`,
> `Outlet`, `Navigate`, `useParams`, `useNavigate`, `useLocation`). Do **not** use
> `useMemo`, `useCallback`, `useReducer` or `useRef`. Do not add any library or package.
> JavaScript with JSX, no TypeScript. Do not call `fetch` directly — reuse the hook and the
> form you are given, unchanged. Do not decode the JWT; the role comes from `user.role`.
> Change only the four files named in the contract, and show each one in full.

## Done means

- `npm run inlab` is green, and `npm test` is still green.
- Logged in as the student, `/admin/courses/new` says "You don't have access" — no flicker,
  no trip to the login page. As the admin, you can create a course and land on its page.
- You can say what every line the AI wrote does — or you deleted it.
- `inlab/PROMPTS.md` is filled in.
