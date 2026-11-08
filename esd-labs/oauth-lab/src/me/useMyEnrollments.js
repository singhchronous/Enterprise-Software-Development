// From React Lab 4 (and before). `npm run carry -- ../react-lab4` copies YOUR useMyEnrollments.js over this
// file (section 01). This lab doesn't change it.
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
