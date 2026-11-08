// The route table (sections 04–05): which page shows for which URL.
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
  // TODO (sections 04–05): replace <CoursesPage /> with <Routes> — the route table is in
  // the doc. Keep <AuthProvider> on the outside: every page needs to know who's logged in.
  return (
    <AuthProvider>
      <CoursesPage />
    </AuthProvider>
  );
}
