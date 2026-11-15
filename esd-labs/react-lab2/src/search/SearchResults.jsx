// Pre-lab section 04 — a view that only renders.
//
// SearchResults({ results, status }) shows what a search found. Everything it shows
// arrives as props; it returns JSX. No fetch, no hooks, no state — so it can be tested,
// and reused, with nothing but an array and a string.
//
//   status "idle"                    → nothing at all (return null)
//   status "loading"                 → <p>Searching…</p>
//   status "error"                   → <p>Search failed.</p>
//   status "ready", results is empty → <p>No courses match.</p>
//   status "ready"                   → a <ul>, one <li> per course: "CS101 · Programming Fundamentals"
//                                      (key: the course's id)
export function SearchResults({ results, status }) {
  if (status === "idle") return null;
  if (status === "loading") return <p>Searching…</p>;
  if (status === "error") return <p>Search failed.</p>;
  if (results.length === 0) return <p>No courses match.</p>;
  return (
    <ul className="results">
      {results.map((course) => (
        <li key={course.id}>
          {course.code} · {course.title}
        </li>
      ))}
    </ul>
  );
}
