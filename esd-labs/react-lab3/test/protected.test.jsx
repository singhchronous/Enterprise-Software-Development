// Section 11: a protected route (auth/RequireAuth.jsx) with redirect-back.
import { beforeEach, describe, expect, test } from "vitest";
import { screen } from "@testing-library/react";
import { stubFetch } from "./support/fetch.js";
import { header, logInFromHeader, renderApp, submitLogin } from "./support/app.jsx";

let server;
beforeEach(() => {
  server = stubFetch();
});

describe("11 · protected routes", () => {
  test("/me while logged out shows the login page instead — and asks the API for nothing", async () => {
    renderApp("/me");
    expect(await screen.findByRole("heading", { name: "Log in" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "My courses" })).not.toBeInTheDocument();
    expect(server.requests().some((r) => r.path === "/api/users/me/enrollments")).toBe(false);
  });

  test("logging in there sends you back to /me", async () => {
    const { user } = renderApp("/me");
    await submitLogin(user, "student");
    expect(await screen.findByRole("heading", { name: "My courses" })).toBeInTheDocument();
  });

  test("clicking My courses while logged out, then logging in, also lands on /me", async () => {
    const { user } = renderApp("/");
    await user.click(header().getByRole("link", { name: "My courses" }));
    await submitLogin(user, "student");
    expect(await screen.findByRole("heading", { name: "My courses" })).toBeInTheDocument();
  });

  test("logged in, My courses opens straight away", async () => {
    const { user } = renderApp("/");
    await logInFromHeader(user, "student");
    await user.click(header().getByRole("link", { name: "My courses" }));
    expect(await screen.findByRole("heading", { name: "My courses" })).toBeInTheDocument();
  });

  test("after logging out, /me is protected again", async () => {
    const { user } = renderApp("/");
    await logInFromHeader(user, "student");
    await user.click(header().getByRole("button", { name: "Log out" }));
    await header().findByRole("link", { name: "Log in" });
    await user.click(header().getByRole("link", { name: "My courses" }));
    expect(await screen.findByRole("heading", { name: "Log in" })).toBeInTheDocument();
  });

  test("logging out ON /me takes you to the course list, not the login page", async () => {
    const { user } = renderApp("/me");
    await submitLogin(user, "student");
    await screen.findByRole("heading", { name: "My courses" });
    await user.click(header().getByRole("button", { name: "Log out" }));
    expect(await screen.findByRole("heading", { name: "Courses" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Log in" })).not.toBeInTheDocument();
  });
});
