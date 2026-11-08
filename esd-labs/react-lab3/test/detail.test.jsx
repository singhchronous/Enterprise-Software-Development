// Section 06: links to /courses/:id (courses/CoursesView.jsx), useParams
// (courses/CourseDetail.jsx) and loading one course (courses/useCourse.js).
import { beforeEach, describe, expect, test } from "vitest";
import { screen } from "@testing-library/react";
import { stubFetch } from "./support/fetch.js";
import { renderApp } from "./support/app.jsx";

let server;
beforeEach(() => {
  server = stubFetch();
});

const CS402 = "CS402 · Enterprise Software Development";

describe("06 · URL parameters: the course page", () => {
  test("each course in the list is a link to /courses/<its id>", async () => {
    renderApp("/");
    expect(await screen.findByRole("link", { name: CS402 })).toHaveAttribute("href", "/courses/4");
    expect(screen.getByRole("link", { name: "CS101 · Programming Fundamentals" })).toHaveAttribute("href", "/courses/1");
  });

  test("clicking a course opens its page", async () => {
    const { user } = renderApp("/");
    await user.click(await screen.findByRole("link", { name: CS402 }));
    expect(await screen.findByRole("heading", { name: CS402 })).toBeInTheDocument();
    expect(screen.getByText("3 seats left")).toBeInTheDocument();
    expect(screen.getByText(/Computer Science · 4 credits/)).toBeInTheDocument();
  });

  test("opening /courses/4 directly loads course 4 from the API (a deep link)", async () => {
    renderApp("/courses/4");
    expect(await screen.findByRole("heading", { name: CS402 })).toBeInTheDocument();
    expect(server.requests()).toContainEqual(expect.objectContaining({ method: "GET", path: "/api/courses/4" }));
  });

  test("the id comes from the URL — /courses/10 is a different course", async () => {
    renderApp("/courses/10");
    expect(await screen.findByRole("heading", { name: "MA101 · Linear Algebra" })).toBeInTheDocument();
  });

  test("a full course says Full", async () => {
    renderApp("/courses/2");
    expect(await screen.findByRole("heading", { name: "CS201 · Data Structures" })).toBeInTheDocument();
    expect(screen.getByText("Full")).toBeInTheDocument();
  });

  test("/courses/9999 (a 404 from the API) shows Course not found, with a way back", async () => {
    const { user } = renderApp("/courses/9999");
    expect(await screen.findByRole("heading", { name: "Course not found" })).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Back to the courses" }));
    expect(await screen.findByRole("heading", { name: "Courses" })).toBeInTheDocument();
  });

  test("any other error shows the server's message", async () => {
    renderApp("/courses/abc"); // the API answers 400 "Invalid id: abc"
    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid id: abc");
    expect(screen.queryByRole("heading", { name: "Course not found" })).not.toBeInTheDocument();
  });

  test("← All courses goes back to the list", async () => {
    const { user } = renderApp("/courses/4");
    await user.click(await screen.findByRole("link", { name: "← All courses" }));
    expect(await screen.findByRole("heading", { name: "Courses" })).toBeInTheDocument();
  });
});
