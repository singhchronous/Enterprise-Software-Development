// State shared by the levels of one run: the seed file, logins, and unique names so the
// suite can run again and again against the same server without a restart.
import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { Failure, expectStatus, expectShape, LOGIN } from "./lib.js";

export const SEED = JSON.parse(readFileSync(new URL("../seed/seed.json", import.meta.url), "utf8"));
export const PASSWORDS = Object.fromEntries(SEED.users.map((u) => [u.email, u.password]));
export const FULL_CODES = ["CS201", "EC210", "MA202", "DS220", "HS205"];

const letters = (n) => Array.from(randomBytes(n), (b) => String.fromCharCode(65 + (b % 26))).join("");

export function createContext(api) {
  const run = Date.now().toString(36).slice(-5) + randomBytes(2).toString("hex");
  const ctx = {
    api,
    run,
    users: {},
    // A unique email for this run: conf-<run>-<name>@conformance.test
    email: (name) => `conf-${run}-${name}@conformance.test`,

    // POST /api/auth/login; returns { email, password, token, claims } or throws a Failure.
    async login(email, password = PASSWORDS[email]) {
      const res = await api.post("/api/auth/login", { body: { email, password } });
      if (res.status !== 200) throw new Failure(`HTTP 200 from POST /api/auth/login for ${email}`, res);
      expectShape(res.json, LOGIN, "the login response", res);
      return { email: email.trim().toLowerCase(), password, token: res.json.accessToken, res };
    },

    // Log in a seeded user once per run, and reuse the token.
    async seeded(email) {
      if (!ctx.users[email]) ctx.users[email] = await ctx.login(email);
      return ctx.users[email];
    },

    // Sign up and log in a fresh STUDENT, once per name per run.
    async fresh(name, extra = {}) {
      if (ctx.users[name]) return ctx.users[name];
      const email = ctx.email(name);
      const password = `pw-${run}-${name}`;
      const res = await api.post("/api/auth/signup", { body: { email, password, fullName: `Conformance ${name}`, ...extra } });
      expectStatus(res, 201);
      ctx.users[name] = { ...(await ctx.login(email, password)), id: res.json?.id };
      return ctx.users[name];
    },

    // A course code that matches ^[A-Z]{2,4}[0-9]{3}$ and isn't in `taken`.
    newCode(taken = new Set()) {
      for (;;) {
        const code = letters(4) + String(100 + (randomBytes(2).readUInt16BE() % 900));
        if (!taken.has(code)) { taken.add(code); return code; }
      }
    },
  };
  return ctx;
}
