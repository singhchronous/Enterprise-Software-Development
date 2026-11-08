// /me — the logged-in user's courses, each with a Drop button (section 12).
// Protected: App.jsx wraps it in <RequireAuth>, so a user is always logged in here.
import { useState } from "react";
import { Link } from "react-router";
import { useMyEnrollments } from "./useMyEnrollments.js";

const CREDIT_LIMIT = 24; // from the contract's business rules

export function MyCoursesPage() {
  const { enrollments, status, error, drop } = useMyEnrollments();
  const [dropError, setDropError] = useState(null);

  async function handleDrop(enrollmentId) {
    // TODO (section 12): drop() it; if that throws, show the error's message.
  }

  const credits = enrollments.reduce((sum, e) => sum + e.course.credits, 0); // derived, never stored

  return (
    <>
      <h1>My courses</h1>
      {status === "loading" && <p className="muted">Loading your courses…</p>}
      {status === "error" && <p role="alert" className="error">Couldn't load your courses: {error}</p>}
      {status === "ready" && enrollments.length === 0 && (
        <p>You're not enrolled in any courses yet. <Link to="/">Browse the courses</Link></p>
      )}
      {status === "ready" && enrollments.length > 0 && (
        <>
          <p className="muted">{credits} of {CREDIT_LIMIT} credits</p>
          <ul className="courses">
            {enrollments.map((e) => (
              <li key={e.id} className="row">
                <Link to={`/courses/${e.course.id}`}>{e.course.code} · {e.course.title}</Link>
                <span>{e.course.credits} credits</span>
                <button type="button" onClick={() => handleDrop(e.id)}>Drop</button>
              </li>
            ))}
          </ul>
        </>
      )}
      {dropError && <p role="alert" className="error">{dropError}</p>}
    </>
  );
}
