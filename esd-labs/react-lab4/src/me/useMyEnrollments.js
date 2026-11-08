// From React Lab 3. `npm run carry -- ../react-lab3` copies YOUR useMyEnrollments.js over this
// file (section 01). Then section 06 makes ONE change to it: both requests go through
// useAuth().api — const { token, api } = useAuth(), and api(path, options) without the token.
// The effect's dependency stays [token] (section 06 says why).
//
// The logged-in user's enrollments, and dropping one (React Lab 3 · §12).
//   → { enrollments, status: "loading" | "ready" | "error", error (the message), drop }
// Each enrollment is { id, course: { id, code, title, credits, … }, enrolledAt }.
import { useEffect, useState } from "react";
import { apiFetch } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";

export function useMyEnrollments() {
  const { token } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  // TODO (React Lab 3 · §12): GET /api/users/me/enrollments — with the token this time.
  // Same effect pattern as useCourse. What goes in the dependency array?

  // DELETE /api/enrollments/{id}, then take it out of the list (a new array — never splice).
  async function drop(enrollmentId) {
    throw new Error("TODO — from React Lab 3: run npm run carry (section 01 of the doc)");
  }

  return { enrollments, status, error, drop };
}
