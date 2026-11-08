// From React Lab 3. `npm run carry -- ../react-lab3` copies YOUR useCourse.js over this file
// (section 01). Then this lab changes it:
//   enroll() goes through useAuth().api — const { api } = useAuth()             (section 06)
//   after a 409, enroll() loads the course again, with refresh() from the doc   (section 08)
//   update() and remove(), for admins                                          (the in-lab task, section 15)
//
//   useCourse(id) → { course, status: "loading" | "ready" | "error", error, enroll, update, remove }
//
// One course, by id, and enrolling in it (React Lab 3 §06 and 13). Same seam as useCourses:
// the fetching lives here, CourseDetail only renders.
//   → { course, status: "loading" | "ready" | "error", error, enroll }
// Unlike useCourses, `error` is the whole ApiError, not just its message: the page needs
// error.status to tell "no such course" (404) from everything else.
import { useEffect, useState } from "react";
import { apiFetch } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";

export function useCourse(id) {
  const { token } = useAuth();
  const [course, setCourse] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  // TODO (React Lab 3 · §06): GET /api/courses/{id} with apiFetch, in an effect — the same
  // pattern as useCourses, ignore flag and all. Keep the whole error (err.status matters).
  // Which value has to go in the dependency array, and why?

  // POST /api/enrollments as the logged-in user. The answer is the new enrollment, and
  // its `course` is this course with the updated seatsLeft. Throws the ApiError (409…).
  async function enroll() {
    throw new Error("TODO — from React Lab 3: run npm run carry (section 01 of the doc)");
  }

  return { course, status, error, enroll };
}
