// Section 08: Enroll's results as proper states (courses/CourseDetail.jsx, useCourse.js).
// The contract fixes three 409 messages for POST /api/enrollments; the page may compare
// exactly those, and shows each as its own state. After a 409 the page asks again.
import { beforeEach, describe, expect, test } from "vitest";
import { screen, within } from "@testing-library/react";
import { stubFetch } from "./support/fetch.js";
import { logInFromHeader, renderApp } from "./support/app.jsx";

let server;
beforeEach(() => {
  server = stubFetch();
});

const CS402 = "CS402 · Enterprise Software Development"; // 3 seats, 4 credits
const CS501 = "CS501 · Distributed Systems"; // 1 seat left, 4 credits

// Open a course page, log in from the header, and land back on it.
async function onCourseLoggedIn(url, heading, who = "student") {
  const view = renderApp(url);
  await screen.findByRole("heading", { name: heading });
  await logInFromHeader(view.user, who);
  await screen.findByRole("heading", { name: heading });
  return view;
}
// Enroll someone in a course behind the app's back.
async function enrollBehindTheBack(who, courseId) {
  const token = await server.tokenFor(who);
  const res = await server.call("POST", "/api/enrollments", { token, body: { courseId } });
  expect(res.status).toBe(201);
}

describe("08 · enroll conflicts as states", () => {
  test("a course that's full: the page says Full, and Enroll is disabled", async () => {
    renderApp("/courses/2"); // CS201, seeded full
    expect(await screen.findByText("Full")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enroll" })).toBeDisabled();
  });

  test("enrolled: \"You're enrolled.\", the server's seats, and a link to My courses", async () => {
    const { user } = await onCourseLoggedIn("/courses/4", CS402);
    await user.click(screen.getByRole("button", { name: "Enroll" }));
    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("You're enrolled.");
    expect(within(status).getByRole("link", { name: "My courses" })).toHaveAttribute("href", "/me");
    expect(screen.getByText("2 seats left")).toBeInTheDocument();
  });

  test("already enrolled: says so in words, with a link to My courses", async () => {
    await enrollBehindTheBack("student", 4); // enrolled earlier, in another tab
    const { user } = await onCourseLoggedIn("/courses/4", CS402);
    await user.click(screen.getByRole("button", { name: "Enroll" }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/already enrolled/i);
    expect(within(alert).getByRole("link", { name: "My courses" })).toHaveAttribute("href", "/me");
  });

  test("someone took the last seat while you were looking: the 409 says full, and the page catches up", async () => {
    const { user } = await onCourseLoggedIn("/courses/5", CS501);
    expect(screen.getByText("1 seat left")).toBeInTheDocument();
    await enrollBehindTheBack("riya", 5); // the last seat goes, the page doesn't know

    await user.click(screen.getByRole("button", { name: "Enroll" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/full/i);
    expect(await screen.findByText("Full")).toBeInTheDocument(); // fresh numbers from the server
    expect(screen.getByRole("button", { name: "Enroll" })).toBeDisabled();
  });

  test("…because after the 409 the page asked for the course again", async () => {
    const { user } = await onCourseLoggedIn("/courses/5", CS501);
    await enrollBehindTheBack("riya", 5);
    await user.click(screen.getByRole("button", { name: "Enroll" }));
    await screen.findByRole("alert");
    await screen.findByText("Full");
    const sent = server.requests().map((r) => `${r.method} ${r.path}`);
    const post = sent.lastIndexOf("POST /api/enrollments");
    expect(sent.slice(post + 1)).toContain("GET /api/courses/5");
  });

  test("the credit limit: says so in words, with a link to My courses", async () => {
    await enrollBehindTheBack("riya", 3); // Riya: 18 seeded credits + CS305 (4) = 22
    const { user } = await onCourseLoggedIn("/courses/4", CS402, "riya"); // + 4 would be 26
    await user.click(screen.getByRole("button", { name: "Enroll" }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(/24-credit limit/);
    expect(within(alert).getByRole("link", { name: "My courses" })).toHaveAttribute("href", "/me");
    expect(screen.getByText("3 seats left")).toBeInTheDocument(); // still there: it wasn't the seats
  });
});
