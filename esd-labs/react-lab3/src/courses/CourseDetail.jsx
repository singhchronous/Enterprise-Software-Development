// The page for one course: /courses/:id (sections 06 and 13).
import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import { useAuth } from "../auth/AuthContext.jsx";
import { useCourse } from "./useCourse.js";

// The same wording as the list (CoursesView).
const seats = (n) => (n === 0 ? "Full" : n === 1 ? "1 seat left" : `${n} seats left`);

export function CourseDetail() {
  const id = "1"; // TODO (section 06): read :id from the URL with useParams()
  const { course, status, error, enroll } = useCourse(id);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notice, setNotice] = useState(null); // { ok: true|false, text } after Enroll

  async function handleEnroll() {
    // TODO (section 13): logged out → navigate to /login, with this location in the state
    // as `from`. Logged in → enroll(), then say "You're enrolled." — or show the error's message.
  }

  // TODO (section 06): "Loading course…" while loading. On an error: a "Course not found"
  // heading for a 404, and the error's message for anything else.
  if (status !== "ready") return <p className="muted">Loading course…</p>;

  return (
    <article className="course">
      <p className="back"><Link to="/">← All courses</Link></p>
      <h1>{course.code} · {course.title}</h1>
      <p className="meta">{course.department} · {course.credits} credits · capacity {course.capacity}</p>
      {course.description && <p>{course.description}</p>}
      <p className="seats">{seats(course.seatsLeft)}</p>
      <button type="button" onClick={handleEnroll}>Enroll</button>
      {notice && (
        <p role={notice.ok ? "status" : "alert"} className={notice.ok ? "ok" : "error"}>{notice.text}</p>
      )}
    </article>
  );
}
