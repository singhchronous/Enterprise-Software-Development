// Sections 09–10: loginWithGoogle (src/auth/AuthContext.jsx) and the Google button on the
// login page (src/pages/LoginPage.jsx). The whole app, against the real mock API — which
// verifies every Google token it gets (support/fetch.js, support/google.js).
import { beforeEach, describe, expect, test, vi } from "vitest";
import { screen } from "@testing-library/react";
import { stubFetch } from "./support/fetch.js";
import { clickGoogle, header, renderApp, submitLogin } from "./support/app.jsx";
import { ASHA, CLIENT_ID, fakeGoogle, signIdToken } from "./support/google.js";

let server;
let google;
beforeEach(() => {
  server = stubFetch();
  google = fakeGoogle();
  vi.stubEnv("VITE_GOOGLE_CLIENT_ID", CLIENT_ID);
});

const JWT = /^Bearer [\w-]+\.[\w-]+\.[\w-]+$/;

describe("09–10 · Signing in with Google", () => {
  test("the login page shows the Google button next to the password form", async () => {
    renderApp("/login");
    expect(await screen.findByRole("button", { name: "Sign in with Google" })).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(google.initialize).toHaveBeenCalledWith(expect.objectContaining({ client_id: CLIENT_ID }));
  });

  test("Google's credential is POSTed as { idToken }, then /api/users/me is fetched with OUR new token", async () => {
    const credential = signIdToken();
    google.nextCredential = credential;
    const { user } = renderApp("/login");
    await clickGoogle(user);
    await header().findByRole("button", { name: "Log out" });

    const sent = server.requests();
    const exchange = sent.find((r) => r.path === "/api/auth/google");
    const me = sent.find((r) => r.path === "/api/users/me");
    expect(exchange).toMatchObject({ method: "POST", body: { idToken: credential } });
    expect(exchange.auth).toBeNull(); // no Authorization header: nobody is logged in yet
    expect(me.auth).toMatch(JWT);
    expect(me.auth).not.toBe(`Bearer ${credential}`); // our API's token, not Google's
    expect(sent.indexOf(exchange)).toBeLessThan(sent.indexOf(me));
  });

  test("afterwards you're on /, and the header shows the name from /api/users/me — a new STUDENT", async () => {
    const { user } = renderApp("/login");
    await clickGoogle(user);
    expect(await screen.findByRole("heading", { name: "Courses" })).toBeInTheDocument();
    expect(header().getByText(ASHA.name)).toBeInTheDocument();
    expect(header().getByText("STUDENT")).toBeInTheDocument();
    expect(header().queryByRole("link", { name: "Log in" })).not.toBeInTheDocument();
  });

  test("redirect-back works for Google too: /me → log in with Google → back on My courses", async () => {
    const { user } = renderApp("/me");
    expect(await screen.findByRole("heading", { name: "Log in" })).toBeInTheDocument();
    await clickGoogle(user);
    expect(await screen.findByRole("heading", { name: "My courses" })).toBeInTheDocument();
  });

  test("when the backend refuses the token (401), its message is shown, and nobody is logged in", async () => {
    google.nextCredential = signIdToken({ aud: "some-other-app.apps.googleusercontent.com" }); // minted for another app
    const { user } = renderApp("/login");
    await clickGoogle(user);
    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid Google token");
    expect(screen.getByRole("heading", { name: "Log in" })).toBeInTheDocument();
    expect(header().queryByRole("button", { name: "Log out" })).not.toBeInTheDocument();
    expect(server.requests().some((r) => r.path === "/api/users/me")).toBe(false);
  });

  test("after a refused token, the page still works: the password form logs in", async () => {
    google.nextCredential = signIdToken({ exp: Math.floor(Date.now() / 1000) - 300 }); // expired five minutes ago (beyond the 60 s skew)
    const { user } = renderApp("/login");
    await clickGoogle(user);
    await screen.findByRole("alert");
    await submitLogin(user, "student");
    expect(await header().findByText("Sam Student")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("a Google session is an ordinary session: it survives a reload, and Log out ends it on the server", async () => {
    const first = renderApp("/login");
    await clickGoogle(first.user);
    await header().findByText(ASHA.name);
    const token = server.requests().find((r) => r.path === "/api/users/me").auth.slice("Bearer ".length);
    first.unmount(); // a reload: sessionStorage stays

    const second = renderApp("/me");
    expect(await screen.findByRole("heading", { name: "My courses" })).toBeInTheDocument();
    await second.user.click(header().getByRole("button", { name: "Log out" }));
    expect(await header().findByRole("link", { name: "Log in" })).toBeInTheDocument();
    expect((await server.call("GET", "/api/users/me", { token })).status).toBe(401);
  });

  test("a Google session expires like any other (React Lab 4's flow) — and signing in with Google clears the notice", async () => {
    const { user } = renderApp("/login");
    await clickGoogle(user);
    await header().findByText(ASHA.name);
    const token = server.requests().find((r) => r.path === "/api/users/me").auth.slice("Bearer ".length);
    await server.call("POST", "/api/auth/logout", { token }); // the token dies behind the app's back

    await user.click(header().getByRole("link", { name: "My courses" }));
    expect(await screen.findByText(/Your session has expired/)).toBeInTheDocument();
    await clickGoogle(user);
    expect(await screen.findByRole("heading", { name: "My courses" })).toBeInTheDocument();

    await user.click(header().getByRole("button", { name: "Log out" }));
    await user.click(await header().findByRole("link", { name: "Log in" }));
    await screen.findByRole("heading", { name: "Log in" });
    expect(screen.queryByText(/Your session has expired/)).not.toBeInTheDocument(); // like login(), it reset `expired`
  });

  test("with no client ID configured, the page says Google sign-in isn't set up — and password login still works", async () => {
    vi.stubEnv("VITE_GOOGLE_CLIENT_ID", "");
    const { user } = renderApp("/login");
    expect(await screen.findByText(/Google sign-in isn't set up/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Sign in with Google" })).not.toBeInTheDocument();
    expect(google.initialize).not.toHaveBeenCalled();
    await submitLogin(user, "student");
    expect(await header().findByText("Sam Student")).toBeInTheDocument();
  });
});
