// Given — don't edit. The tests' backend: the real mock API (mock/api.js), run in memory.
//
// stubFetch() replaces the global fetch with one that hands every request to a fresh copy
// of the mock, so each test starts from the seed data, with no server and no network.
// Your code calls fetch exactly as it does in the browser; it can't tell the difference.
import { Readable } from "node:stream";
import { vi } from "vitest";
import { createApi } from "../../mock/api.js";

export const ACCOUNTS = {
  student: { email: "student@esd.local", password: "student12345", fullName: "Sam Student" },
  admin: { email: "admin@esd.local", password: "admin12345", fullName: "Course Admin" },
  riya: { email: "riya@esd.local", password: "riya12345", fullName: "Riya Sharma" },
};

export function stubFetch() {
  const api = createApi();

  async function handle(input, init = {}) {
    const url = new URL(String(input), "http://localhost");
    const req = Readable.from(init.body == null ? [] : [Buffer.from(String(init.body))], { objectMode: false });
    req.url = url.pathname + url.search;
    req.method = (init.method ?? "GET").toUpperCase();
    req.headers = Object.fromEntries(new Headers(init.headers ?? {}));
    const res = await new Promise((resolve) => {
      api(req, {
        statusCode: 200,
        headers: {},
        setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
        end(text) { resolve({ status: this.statusCode, headers: this.headers, text }); },
      });
    });
    return new Response(res.text ?? null, { status: res.status, headers: res.headers });
  }

  // A call straight to the mock, not recorded as one of your app's requests.
  async function call(method, path, { token, body } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await handle(path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    return { status: res.status, body: res.status === 204 ? null : await res.json() };
  }

  const fetch = vi.fn(handle);
  vi.stubGlobal("fetch", fetch);

  return {
    fetch,
    call,
    // Log in as one of the ACCOUNTS behind the app's back; returns the token.
    async tokenFor(who) {
      const { email, password } = ACCOUNTS[who];
      return (await call("POST", "/api/auth/login", { body: { email, password } })).body.accessToken;
    },
    // The requests your app sent, as { method, path, auth, body }.
    requests() {
      return fetch.mock.calls.map(([input, init = {}]) => ({
        method: (init.method ?? "GET").toUpperCase(),
        path: new URL(String(input), "http://localhost").pathname,
        auth: new Headers(init.headers ?? {}).get("authorization"),
        body: init.body == null ? undefined : JSON.parse(init.body),
      }));
    },
  };
}
