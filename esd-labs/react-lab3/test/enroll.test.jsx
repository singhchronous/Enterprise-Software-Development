// Section 13: the Enroll button (courses/CourseDetail.jsx) and enroll() (courses/useCourse.js),
// end to end: logged out → log in → back → enroll → My courses.
import { beforeEach, describe, expect, test } from "vitest";
import { screen } from "@testing-library/react";
import { stubFetch } from "./support/fetch.js";
import { header, renderApp, submitLogin } from "./support/app.jsx";

let server;
beforeEach(() => {
  server = stubFetch();
});

const CS402 = "CS402 · Enterprise Software Development";

// Open /courses/4 logged out, press Enroll, log in, and come back to the course.
async function backOnCourseAfterLogin(url = "/courses/4", heading = CS402) {
  const view = renderApp(url);
  await screen.findByRole("heading", { name: heading });
  await view.user.click(screen.getByRole("button", { name: "Enroll" }));
  await submitLogin(view.user, "student");
  await screen.findByRole("heading", { name: heading });
  return view;
}

describe("13 · enrolling", () => {
  test("logged out, Enroll sends you to the login page", async () => {
    const { user } = renderApp("/courses/4");
    await user.click(await screen.findByRole("button", { name: "Enroll" }));
    expect(await screen.findByRole("heading", { name: "Log in" })).toBeInTheDocument();
    expect(server.requests().some((r) => r.path === "/api/enrollments")).toBe(false);
  });

  test("…and after logging in you're back on the same course", async () => {
    await backOnCourseAfterLogin();
    expect(screen.getByRole("heading", { name: CS402 })).toBeInTheDocument();
  });

  test("logged in, Enroll POSTs /api/enrollments with the token, says so, and updates the seats", async () => {
    const { user } = await backOnCourseAfterLogin();
    expect(screen.getByText("3 seats left")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Enroll" }));
    expect(await screen.findByRole("status")).toHaveTextContent("You're enrolled.");
    expect(screen.getByText("2 seats left")).toBeInTheDocument();
    const post = server.requests().find((r) => r.path === "/api/enrollments");
    expect(post).toMatchObject({ method: "POST", body: { courseId: 4 } });
    expect(post.auth).toMatch(/^Bearer \S+$/);
  });

  test("enrolling twice shows the server's 409 message", async () => {
    const { user } = await backOnCourseAfterLogin();
    await user.click(screen.getByRole("button", { name: "Enroll" }));
    await screen.findByRole("status");
    await user.click(screen.getByRole("button", { name: "Enroll" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Already enrolled in this course");
  });

  test("a full course: the server says Course is full", async () => {
    const { user } = await backOnCourseAfterLogin("/courses/2", "CS201 · Data Structures");
    await user.click(screen.getByRole("button", { name: "Enroll" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Course is full");
  });

  test("the new enrollment is in My courses", async () => {
    const { user } = await backOnCourseAfterLogin();
    await user.click(screen.getByRole("button", { name: "Enroll" }));
    await screen.findByRole("status");
    await user.click(header().getByRole("link", { name: "My courses" }));
    expect(await screen.findByRole("link", { name: CS402 })).toHaveAttribute("href", "/courses/4");
  });
});
