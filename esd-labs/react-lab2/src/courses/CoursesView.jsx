function seatsText(seatsLeft) {
  if (seatsLeft === 0) return "Full";
  if (seatsLeft === 1) return "1 seat left";
  return `${seatsLeft} seats left`;
}

export function CoursesView({ courses, status, error }) {
  if (status === "loading") return <p>Loading courses…</p>;
  if (status === "error") return <p>Couldn't load courses: {error}</p>;
  if (courses.length === 0) return <p>No courses yet.</p>;
  return (
    <ul>
      {courses.map((course) => (
        <li key={course.id}>
          <div>
            {course.code} · {course.title}
          </div>
          <div>
            {course.credits} credits · {course.department} · {seatsText(course.seatsLeft)}
          </div>
        </li>
      ))}
    </ul>
  );
}
