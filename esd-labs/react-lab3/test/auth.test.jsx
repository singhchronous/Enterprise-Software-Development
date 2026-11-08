// Section 10: AuthContext (auth/AuthContext.jsx), the login page (pages/LoginPage.jsx),
// and who's-logged-in in the header (pages/Layout.jsx).
import { beforeEach, describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { stubFetch } from "./support/fetch.js";
import { header, logInFromHeader, renderApp, submitLogin } from "./support/app.jsx";
import { useAuth } from "../src/auth/AuthContext.jsx";

let server;
beforeEach(() => {
  server = stubFetch();
});

const JWT = /^Bearer [\w-]+\.[\w-]+\.[\w-]+$/;

describe("10 · AuthContext and the login page", () => {
  test("logging in takes you to / and the header shows your name and Log out", async () => {
    const { user } = renderApp("/login");
    await submitLogin(user, "student");
    expect(await screen.findByRole("heading", { name: "Courses" })).toBeInTheDocument();
    expect(header().getByText("Sam Student")).toBeInTheDocument();
    expect(header().getByRole("button", { name: "Log out" })).toBeInTheDocument();
    expect(header().queryByRole("link", { name: "Log in" })).not.toBeInTheDocument();
  });

  test("login POSTs the credentials, then GETs /api/users/me with the new token", async () => {
    const { user } = renderApp("/login");
    await submitLogin(user, "student");
    await screen.findByRole("button", { name: "Log out" });
    const sent = server.requests();
    const login = sent.find((r) => r.path === "/api/auth/login");
    const me = sent.find((r) => r.path === "/api/users/me");
    expect(login).toMatchObject({ method: "POST", body: { email: "student@esd.local", password: "student12345" } });
    expect(me).toMatchObject({ method: "GET" });
    expect(me.auth).toMatch(JWT);
    expect(sent.indexOf(login)).toBeLessThan(sent.indexOf(me));
  });

  test("a wrong password shows the server's message, and logs nobody in", async () => {
    const { user } = renderApp("/login");
    await submitLogin(user, "student", "not-my-password");
    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password");
    expect(screen.getByRole("heading", { name: "Log in" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Log out" })).not.toBeInTheDocument();
  });

  test("the inputs are controlled: what you type is what is sent", async () => {
    const { user } = renderApp("/login");
    await user.type(screen.getByLabelText("Email"), "admin@esd.local");
    await user.type(screen.getByLabelText("Password"), "admin12345");
    expect(screen.getByLabelText("Email")).toHaveValue("admin@esd.local");
    await user.click(screen.getByRole("button", { name: "Log in" }));
    expect(await header().findByText("Course Admin")).toBeInTheDocument();
  });

  test("Log out tells the server (which revokes the token), then forgets you", async () => {
    const { user } = renderApp("/");
    await logInFromHeader(user, "student");
    const token = server.requests().find((r) => r.path === "/api/users/me").auth.slice("Bearer ".length);

    await user.click(header().getByRole("button", { name: "Log out" }));
    expect(await header().findByRole("link", { name: "Log in" })).toBeInTheDocument();
    expect(header().queryByText("Sam Student")).not.toBeInTheDocument();

    const logout = server.requests().find((r) => r.path === "/api/auth/logout");
    expect(logout).toMatchObject({ method: "POST", auth: `Bearer ${token}` });
    expect((await server.call("GET", "/api/users/me", { token })).status).toBe(401);
  });

  test("Log out forgets you even if the server can't be reached", async () => {
    const { user } = renderApp("/");
    await logInFromHeader(user, "student");
    const real = server.fetch.getMockImplementation();
    server.fetch.mockImplementation((input, init) =>
      String(input).endsWith("/api/auth/logout") ? Promise.reject(new TypeError("Failed to fetch")) : real(input, init)
    );
    await user.click(header().getByRole("button", { name: "Log out" }));
    expect(await header().findByRole("link", { name: "Log in" })).toBeInTheDocument();
  });

  test("useAuth() outside <AuthProvider> throws an error that names AuthProvider", () => {
    function Probe() {
      let result;
      try {
        useAuth();
        result = "no error";
      } catch (error) {
        result = error.message;
      }
      return <p>{result}</p>;
    }
    render(<Probe />);
    expect(screen.getByText(/AuthProvider/)).toBeInTheDocument();
  });
});
