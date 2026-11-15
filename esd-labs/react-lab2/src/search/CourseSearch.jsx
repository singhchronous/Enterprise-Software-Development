// Pre-lab section 06 — a controlled input, and the pieces put together.
//
// CourseSearch: a search box, and what it finds.
//   - A heading "Search the catalogue".
//   - <label>Search courses</label> and an <input type="search"> that is CONTROLLED:
//     its value comes from state (query), and onChange puts what was typed into that state.
//   - useCourseSearch(query) does the fetching; SearchResults shows the outcome.
// This component owns the query (nobody else needs it) and nothing else.
import { useState } from "react";
import { useCourseSearch } from "./useCourseSearch.js";
import { SearchResults } from "./SearchResults.jsx";
import { useDebounced } from "./useDebounced.js";

export function CourseSearch() {
  // Replace this line with the search box (pre-lab section 06).
  const [query, setQuery] = useState("");
  // Stretch: search only once typing has paused for 250 ms.
  const { results, status } = useCourseSearch(useDebounced(query, 250));

  return (
    <section className="course-search">
      <h2>Search the catalogue</h2>
      <label htmlFor="course-search">Search courses</label>
      <input
        id="course-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <SearchResults results={results} status={status} />
    </section>
  );
}
