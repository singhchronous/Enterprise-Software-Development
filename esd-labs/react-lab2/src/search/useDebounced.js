// STRETCH (pre-lab section 06) — useDebounced(value, ms)
//
// Returns `value`, but only once it has stopped changing for `ms` milliseconds; until then,
// the previous settled value. Typing "learn" quickly then gives one change ("learn"), not
// five — so useCourseSearch sends one request, not five. JS Lab 2 §09's debounce, as a hook:
// a useState for the settled value, and a useEffect that starts a timer when `value`
// changes and whose cleanup cancels the previous timer (clearTimeout).
//
// Then use it in CourseSearch:  useCourseSearch(useDebounced(query, 250))
import { useEffect, useState } from "react";

export function useDebounced(value, ms) {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), ms);
    return () => clearTimeout(timer); // a new value (or unmounting) cancels the old timer
  }, [value, ms]);

  return settled;
}
