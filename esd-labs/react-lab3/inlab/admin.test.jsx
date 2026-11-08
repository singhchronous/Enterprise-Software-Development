// IN-LAB TASK (section 15) — run with:  npm run inlab
// The spec is inlab/CONTRACT.md. Don't edit this file.
import { beforeEach, describe, expect, test } from "vitest";
import { screen } from "@testing-library/react";
import { stubFetch } from "../test/support/fetch.js";
import { header, logInFromHeader, renderApp, submitLogin } from "../test/support/app.jsx";

let server;
beforeEach(() => {
  server = stubFetch();
});

async function fillCourse(user, fields) {
  for (const [label, value] of Object.entries(fields)) {
    await user.clear(screen.getByLabelText(label));
    await user.type(screen.getByLabelText(label), value);
  }
}

describe("in-lab · /admin/courses/new, for ADMINs only", () => {
  test("logged out: the login page, then back to the form as an admin", async () => {
    const { user } = renderApp("/admin/courses/new");
    expect(await screen.findByRole("heading", { name: "Log in" })).toBeInTheDocument();
    await submitLogin(user, "admin");
    expect(await screen.findByRole("heading", { name: "New course" })).toBeInTheDocument();
  });

  test("a STUDENT has no New course link in the header", async () => {
    const { user } = renderApp("/me");
    await submitLogin(user, "student");
    await screen.findByRole("heading", { name: "My courses" });
    expect(header().queryByRole("link", { name: "New course" })).not.toBeInTheDocument();
  });

  test("a STUDENT who opens the URL anyway gets \"You don't have access\" — not the login page", async () => {
    const { user } = renderApp("/admin/courses/new");
    await submitLogin(user, "student"); // RequireRole sent us to log in; now we're a student
    expect(await screen.findByRole("heading", { name: "You don't have access" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Log in" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Code")).not.toBeInTheDocument();
    expect(header().getByRole("button", { name: "Log out" })).toBeInTheDocument(); // still logged in
  });

  test("an ADMIN sees New course in the header, and it opens the form", async () => {
    const { user } = renderApp("/");
    await logInFromHeader(user, "admin");
    await user.click(header().getByRole("link", { name: "New course" }));
    expect(await screen.findByRole("heading", { name: "New course" })).toBeInTheDocument();
    expect(screen.getByLabelText("Code")).toBeInTheDocument();
  });

  test("an ADMIN creates a course: POST with the token, then the new course's own page", async () => {
    const { user } = renderApp("/admin/courses/new");
    await submitLogin(user, "admin");
    await screen.findByRole("heading", { name: "New course" });
    await fillCourse(user, { Code: "CS610", Title: "Cloud Computing", Department: "Computer Science", Credits: "4", Capacity: "60" });
    await user.click(screen.getByRole("button", { name: "Add course" }));

    expect(await screen.findByRole("heading", { name: "CS610 · Cloud Computing" })).toBeInTheDocument();
    expect(screen.getByText("60 seats left")).toBeInTheDocument();
    const post = server.requests().find((r) => r.method === "POST" && r.path === "/api/courses");
    expect(post.body).toMatchObject({ code: "CS610", title: "Cloud Computing", credits: 4, capacity: 60 });
    expect(post.auth).toMatch(/^Bearer \S+$/);
  });

  test("the server's errors still show on the form (409: the code exists)", async () => {
    const { user } = renderApp("/admin/courses/new");
    await submitLogin(user, "admin");
    await screen.findByRole("heading", { name: "New course" });
    await fillCourse(user, { Code: "CS101", Title: "Again", Department: "Computer Science", Credits: "4", Capacity: "60" });
    await user.click(screen.getByRole("button", { name: "Add course" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Course code already exists");
    expect(screen.getByRole("heading", { name: "New course" })).toBeInTheDocument();
  });
});
