// Section 12: the logged-in user's enrollments (me/useMyEnrollments.js) and dropping one
// (me/MyCoursesPage.jsx).
import { beforeEach, describe, expect, test } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import { stubFetch } from "./support/fetch.js";
import { renderApp, submitLogin } from "./support/app.jsx";

let server;
beforeEach(() => {
  server = stubFetch();
});

// Enroll `who` in some courses directly on the server, before the app starts.
async function enrolled(who, ...courseIds) {
  const token = await server.tokenFor(who);
  for (const courseId of courseIds) await server.call("POST", "/api/enrollments", { token, body: { courseId } });
  return token;
}

async function openMyCourses(who) {
  const view = renderApp("/me");
  await submitLogin(view.user, who);
  await screen.findByRole("heading", { name: "My courses" });
  return view;
}

describe("12 · My courses", () => {
  test("no enrollments yet: it says so, with a link to the courses", async () => {
    await openMyCourses("student");
    expect(await screen.findByText(/not enrolled in any courses yet/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse the courses" })).toHaveAttribute("href", "/");
  });

  test("lists your enrollments, each a link to its course page", async () => {
    await enrolled("student", 4, 10);
    await openMyCourses("student");
    expect(await screen.findByRole("link", { name: "CS402 · Enterprise Software Development" })).toHaveAttribute("href", "/courses/4");
    expect(screen.getByRole("link", { name: "MA101 · Linear Algebra" })).toHaveAttribute("href", "/courses/10");
  });

  test("the request carries the token: GET /api/users/me/enrollments with Authorization", async () => {
    await openMyCourses("student");
    await screen.findByText(/not enrolled in any courses yet/);
    const request = server.requests().find((r) => r.path === "/api/users/me/enrollments");
    expect(request).toMatchObject({ method: "GET" });
    expect(request.auth).toMatch(/^Bearer \S+$/);
  });

  test("they're the logged-in user's own: Riya sees her five, in the server's order", async () => {
    await openMyCourses("riya");
    await screen.findByRole("link", { name: /^CS201/ });
    const codes = screen.getAllByRole("listitem").map((li) => within(li).getByRole("link").textContent.slice(0, 5));
    expect(codes).toEqual(["CS201", "EC210", "MA202", "DS220", "HS205"]);
  });

  test("Drop sends DELETE /api/enrollments/{id} and the course leaves the list — and the server", async () => {
    const token = await enrolled("student", 4, 10);
    const { user } = await openMyCourses("student");
    const row = (await screen.findByRole("link", { name: "CS402 · Enterprise Software Development" })).closest("li");
    await user.click(within(row).getByRole("button", { name: "Drop" }));

    await waitFor(() => expect(screen.queryByRole("link", { name: /^CS402/ })).not.toBeInTheDocument());
    expect(screen.getByRole("link", { name: "MA101 · Linear Algebra" })).toBeInTheDocument();
    const drop = server.requests().find((r) => r.method === "DELETE");
    expect(drop.path).toMatch(/^\/api\/enrollments\/\d+$/);
    expect(drop.auth).toMatch(/^Bearer \S+$/);
    const left = (await server.call("GET", "/api/users/me/enrollments", { token })).body;
    expect(left.map((e) => e.course.code)).toEqual(["MA101"]);
  });

  test("dropping the last one shows the empty message", async () => {
    await enrolled("student", 4);
    const { user } = await openMyCourses("student");
    await user.click(await screen.findByRole("button", { name: "Drop" }));
    expect(await screen.findByText(/not enrolled in any courses yet/)).toBeInTheDocument();
  });
});
