// Sections 05–06: one place for 401. useAuth().api adds the token and, on a 401, ends the
// session: the login page says so, and logging in brings you back where you were.
// Two real ways a token dies, both used here: the server restarts (a new signing secret,
// so every old token fails), or the token is logged out somewhere else (revoked).
import { beforeEach, describe, expect, test } from "vitest";
import { screen } from "@testing-library/react";
import { sessionToken, stubFetch } from "./support/fetch.js";
import { header, logInFromHeader, renderApp, submitLogin } from "./support/app.jsx";

let server;
beforeEach(() => {
  server = stubFetch();
});

const EXPIRED = /Your session has expired — log in again/;
const CS402 = "CS402 · Enterprise Software Development";

// "Logged out in another tab": the server revokes the app's token behind its back.
const revokeBehindTheAppsBack = () => server.call("POST", "/api/auth/logout", { token: sessionToken() });

describe("05–06 · a 401 on a logged-in request ends the session", () => {
  test("the server restarts; you open My courses → the login page, saying your session expired", async () => {
    const { user } = renderApp("/");
    await logInFromHeader(user, "student");
    server.restart();
    await user.click(header().getByRole("link", { name: "My courses" }));
    expect(await screen.findByRole("heading", { name: "Log in" })).toBeInTheDocument();
    expect(screen.getByText(EXPIRED)).toBeInTheDocument();
    expect(header().getByRole("link", { name: "Log in" })).toBeInTheDocument(); // logged out
  });

  test("…log in again, and you're back on My courses", async () => {
    const { user } = renderApp("/");
    await logInFromHeader(user, "student");
    server.restart();
    await user.click(header().getByRole("link", { name: "My courses" }));
    await screen.findByText(EXPIRED);
    await submitLogin(user, "student");
    expect(await screen.findByRole("heading", { name: "My courses" })).toBeInTheDocument();
    expect(screen.queryByText(EXPIRED)).not.toBeInTheDocument();
  });

  test("the dead session is gone from sessionStorage too", async () => {
    const { user } = renderApp("/");
    await logInFromHeader(user, "student");
    server.restart();
    await user.click(header().getByRole("link", { name: "My courses" }));
    await screen.findByText(EXPIRED);
    expect(sessionStorage.getItem("esd-session")).toBeNull();
  });

  test("a reload with a dead token in sessionStorage → the first logged-in request sends you to log in", async () => {
    const first = renderApp("/");
    await logInFromHeader(first.user, "student");
    first.unmount(); // a reload: the stored session survives…
    server.restart(); // …but the server forgot the token overnight

    renderApp("/me");
    expect(await screen.findByText(EXPIRED)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Log in" })).toBeInTheDocument();
  });

  test("Enroll after you were logged out in another tab → log in → back on the same course", async () => {
    const { user } = renderApp("/courses/4");
    await logInFromHeader(user, "student");
    await screen.findByRole("heading", { name: CS402 });
    await revokeBehindTheAppsBack();

    await user.click(screen.getByRole("button", { name: "Enroll" }));
    expect(await screen.findByText(EXPIRED)).toBeInTheDocument();
    await submitLogin(user, "student");
    expect(await screen.findByRole("heading", { name: CS402 })).toBeInTheDocument();
  });

  test("Drop with a revoked token → the login page, saying so", async () => {
    const { user } = renderApp("/me");
    await submitLogin(user, "riya");
    await screen.findByRole("heading", { name: "My courses" });
    const drops = await screen.findAllByRole("button", { name: "Drop" });
    await revokeBehindTheAppsBack();
    await user.click(drops[0]);
    expect(await screen.findByText(EXPIRED)).toBeInTheDocument();
    expect(server.requests().some((r) => r.method === "DELETE")).toBe(true);
  });

  test("an admin adding a course with a revoked token → the login page, saying so", async () => {
    const { user } = renderApp("/admin/courses/new");
    await submitLogin(user, "admin");
    await screen.findByRole("heading", { name: "New course" });
    await revokeBehindTheAppsBack();
    for (const [label, value] of Object.entries({ Code: "CS610", Title: "Cloud", Department: "CS", Credits: "4", Capacity: "60" })) {
      await user.type(screen.getByLabelText(label), value);
    }
    await user.click(screen.getByRole("button", { name: "Add course" }));
    expect(await screen.findByText(EXPIRED)).toBeInTheDocument();
  });

  test("every logged-in request still carries the token (it goes through api)", async () => {
    const { user } = renderApp("/");
    await logInFromHeader(user, "student");
    await user.click(header().getByRole("link", { name: "My courses" }));
    await screen.findByRole("heading", { name: "My courses" });
    const load = server.requests().find((r) => r.path === "/api/users/me/enrollments");
    expect(load.auth).toBe(`Bearer ${sessionToken()}`);
  });
});

describe("06 · …and only a 401 on a logged-in request", () => {
  test("a wrong password is not an expired session: the server's message, nothing else", async () => {
    const { user } = renderApp("/login");
    await submitLogin(user, "student", "not-my-password");
    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password");
    expect(screen.queryByText(EXPIRED)).not.toBeInTheDocument();
  });

  test("Log out with a token that's already dead: you're simply logged out, on the course list", async () => {
    const { user } = renderApp("/");
    await logInFromHeader(user, "student");
    await revokeBehindTheAppsBack();
    await user.click(header().getByRole("button", { name: "Log out" }));
    expect(await header().findByRole("link", { name: "Log in" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Courses" })).toBeInTheDocument();
    expect(screen.queryByText(EXPIRED)).not.toBeInTheDocument();
  });

  test("once you've logged in again, the message is gone for good", async () => {
    const { user } = renderApp("/");
    await logInFromHeader(user, "student");
    server.restart();
    await user.click(header().getByRole("link", { name: "My courses" }));
    await screen.findByText(EXPIRED);
    await submitLogin(user, "student");
    await screen.findByRole("heading", { name: "My courses" });
    await user.click(header().getByRole("button", { name: "Log out" }));
    await user.click(await header().findByRole("link", { name: "Log in" }));
    expect(await screen.findByRole("heading", { name: "Log in" })).toBeInTheDocument();
    expect(screen.queryByText(EXPIRED)).not.toBeInTheDocument();
  });
});
