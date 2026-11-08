// Section 07: the signup page (pages/SignupPage.jsx), signup() in AuthContext, the route,
// and the link from the login page. The server's fieldErrors go under their fields.
import { beforeEach, describe, expect, test } from "vitest";
import { screen, within } from "@testing-library/react";
import { stubFetch } from "./support/fetch.js";
import { header, renderApp } from "./support/app.jsx";

let server;
beforeEach(() => {
  server = stubFetch();
});

// Fill in the signup form (empty strings are left empty) and press "Sign up".
async function signUp(user, { fullName = "", email = "", password = "" }) {
  if (fullName) await user.type(await screen.findByLabelText("Full name"), fullName);
  if (email) await user.type(await screen.findByLabelText("Email"), email);
  if (password) await user.type(await screen.findByLabelText("Password"), password);
  await user.click(screen.getByRole("button", { name: "Sign up" }));
}

describe("07 · signing up", () => {
  test("the login page links to the signup page", async () => {
    const { user } = renderApp("/login");
    await user.click(screen.getByRole("link", { name: "Sign up" }));
    expect(await screen.findByRole("heading", { name: "Create an account" })).toBeInTheDocument();
    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
  });

  test("bad values: each field shows the server's message, tied to the field", async () => {
    const { user } = renderApp("/signup");
    await signUp(user, { email: "not-an-email", password: "short" });

    const email = screen.getByLabelText("Email");
    await screen.findByText("must be a well-formed email address");
    expect(email).toHaveAccessibleDescription("must be a well-formed email address");
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Password")).toHaveAccessibleDescription("size must be between 8 and 64");
    expect(screen.getByLabelText("Full name")).toHaveAccessibleDescription("must be 1–100 characters");
  });

  test("…the request went to the server as typed, and nobody is logged in", async () => {
    const { user } = renderApp("/signup");
    await signUp(user, { email: "not-an-email", password: "short" });
    await screen.findByText("must be a well-formed email address");
    const sent = server.requests().find((r) => r.path === "/api/auth/signup");
    expect(sent).toMatchObject({ method: "POST", body: { email: "not-an-email", password: "short", fullName: "" } });
    expect(screen.getByLabelText("Email")).toHaveValue("not-an-email"); // what you typed stays
    expect(header().getByRole("link", { name: "Log in" })).toBeInTheDocument();
  });

  test("only the fields the server complained about are marked", async () => {
    const { user } = renderApp("/signup");
    await signUp(user, { fullName: "Asha Rao", email: "asha@", password: "password12" });
    await screen.findByText("must be a well-formed email address");
    expect(screen.getByLabelText("Full name")).not.toHaveAttribute("aria-invalid");
    expect(screen.getByLabelText("Full name")).not.toHaveAccessibleDescription();
    expect(screen.getByLabelText("Password")).not.toHaveAttribute("aria-invalid");
  });

  test("an email that's taken: the server's 409, with a way to log in instead", async () => {
    const { user } = renderApp("/signup");
    await signUp(user, { fullName: "Sam Again", email: "student@esd.local", password: "password12" });
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Email already registered");
    expect(within(alert).getByRole("link", { name: "Log in instead" })).toHaveAttribute("href", "/login");
  });

  test("success: logged in straight away — signup, then login, then /api/users/me", async () => {
    const { user } = renderApp("/signup");
    await signUp(user, { fullName: "Asha Rao", email: "asha@test.com", password: "password12" });
    expect(await header().findByText("Asha Rao")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Courses" })).toBeInTheDocument();
    const paths = server.requests().map((r) => r.path);
    const order = ["/api/auth/signup", "/api/auth/login", "/api/users/me"].map((p) => paths.indexOf(p));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  test("sent to log in from a protected page, signing up instead also brings you back there", async () => {
    const { user } = renderApp("/me");
    await user.click(await screen.findByRole("link", { name: "Sign up" }));
    await signUp(user, { fullName: "Asha Rao", email: "asha@test.com", password: "password12" });
    expect(await screen.findByRole("heading", { name: "My courses" })).toBeInTheDocument();
  });
});
