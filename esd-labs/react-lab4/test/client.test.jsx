// Sections 03 and 05: the API client (src/api/client.js) — no answer at all is a
// NetworkError; a 401 on a request that carried a token calls onUnauthorized.
import { beforeEach, describe, expect, test, vi } from "vitest";
import { screen } from "@testing-library/react";
import { ApiError, NetworkError, apiFetch } from "../src/api/client.js";
import { stubFetch } from "./support/fetch.js";
import { renderApp, submitLogin } from "./support/app.jsx";

const UNREACHABLE = "Can't reach the server — is your backend running?";

// The browser's fetch when nothing answers: it rejects with a TypeError.
const serverDown = () => vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new TypeError("Failed to fetch"))));

describe("03 · no answer at all is a NetworkError", () => {
  test("fetch rejects (server down) → a NetworkError with the message — not an ApiError", async () => {
    serverDown();
    const error = await apiFetch("/api/courses").catch((e) => e);
    expect(error).toBeInstanceOf(NetworkError);
    expect(error).not.toBeInstanceOf(ApiError);
    expect(error.message).toBe(UNREACHABLE);
  });

  test("the NetworkError keeps the browser's own error as its cause", async () => {
    serverDown();
    const error = await apiFetch("/api/courses").catch((e) => e);
    expect(error.cause).toBeInstanceOf(TypeError);
  });

  test("an answer with an error status is still an ApiError (404), not a NetworkError", async () => {
    stubFetch();
    const error = await apiFetch("/api/courses/9999").catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).not.toBeInstanceOf(NetworkError);
    expect(error.status).toBe(404);
  });

  test("the course list says the server can't be reached", async () => {
    serverDown();
    renderApp("/");
    expect(await screen.findByRole("alert")).toHaveTextContent(UNREACHABLE);
  });

  test("so does the login page — not \"Failed to fetch\"", async () => {
    const { user } = renderApp("/login");
    serverDown();
    await submitLogin(user, "student");
    expect(await screen.findByRole("alert")).toHaveTextContent(UNREACHABLE);
  });
});

describe("05 · apiFetch's onUnauthorized", () => {
  let server;
  beforeEach(() => {
    server = stubFetch();
  });

  test("a 401 on a request that carried a token calls onUnauthorized once — and still throws the 401", async () => {
    const token = await server.tokenFor("student");
    await server.call("POST", "/api/auth/logout", { token }); // the token is revoked now
    const onUnauthorized = vi.fn();
    const error = await apiFetch("/api/users/me", { token, onUnauthorized }).catch((e) => e);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.status).toBe(401);
  });

  test("a token the server never issued (a restarted server) → 401 → onUnauthorized", async () => {
    const token = await server.tokenFor("student");
    server.restart(); // a new signing secret: the old token's signature no longer checks out
    const onUnauthorized = vi.fn();
    await apiFetch("/api/users/me/enrollments", { token, onUnauthorized }).catch(() => {});
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  test("a 401 WITHOUT a token — a wrong password at login — is just an answer: not called", async () => {
    const onUnauthorized = vi.fn();
    const error = await apiFetch("/api/auth/login", {
      method: "POST",
      body: { email: "student@esd.local", password: "wrong-password" },
      onUnauthorized,
    }).catch((e) => e);
    expect(error.status).toBe(401);
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  test("a 403 — a valid token, the wrong role — is not an expired session: not called", async () => {
    const token = await server.tokenFor("student");
    const onUnauthorized = vi.fn();
    const error = await apiFetch("/api/courses", { method: "POST", body: {}, token, onUnauthorized }).catch((e) => e);
    expect(error.status).toBe(403);
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  test("a 2xx: not called, and the JSON comes back as before", async () => {
    const token = await server.tokenFor("student");
    const onUnauthorized = vi.fn();
    const me = await apiFetch("/api/users/me", { token, onUnauthorized });
    expect(me).toMatchObject({ email: "student@esd.local", role: "STUDENT" });
    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
