// From React Lab 3 (the route table). `npm run carry -- ../react-lab3` copies YOUR App.jsx over
// this file (section 01). Then this lab adds two routes to it:
//   /signup                   section 07 — import SignupPage from "./pages/SignupPage.jsx"
//   /admin/courses/:id/edit   ADMIN only — the in-lab task (section 15)
// AuthProvider stays inside the router (main.jsx), around the routes: section 05 needs that.
//
// The route table (React Lab 3 · §04–05): which page shows for which URL.
// The router itself is NOT here: main.jsx wraps <App /> in <BrowserRouter>, and the tests
// wrap it in a <MemoryRouter> that starts at whatever URL the test wants.
import { Route, Routes } from "react-router";
import { AuthProvider } from "./auth/AuthContext.jsx";
import { RequireAuth } from "./auth/RequireAuth.jsx";
import { RequireRole } from "./auth/RequireRole.jsx";
import { Layout } from "./pages/Layout.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { NotFound } from "./pages/NotFound.jsx";
import { CoursesPage } from "./courses/CoursesPage.jsx";
import { CourseDetail } from "./courses/CourseDetail.jsx";
import { MyCoursesPage } from "./me/MyCoursesPage.jsx";
import { NewCoursePage } from "./admin/NewCoursePage.jsx";

export default function App() {
  // TODO (React Lab 3 · §04–05): replace <CoursesPage /> with <Routes> — the route table is in
  // the doc. Keep <AuthProvider> on the outside: every page needs to know who's logged in.
  return (
    <AuthProvider>
      <CoursesPage />
    </AuthProvider>
  );
}
