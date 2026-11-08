#!/usr/bin/env node
// Log in and print just the access token — for tools that need one (Schemathesis, curl, Postman).
//
//   npm run -s token                                      admin@esd.local, http://localhost:8080
//   npm run -s token -- student@esd.local student12345    another account
//   npm run -s token -- http://localhost:8090             another server
import { PASSWORDS } from "./context.js";

const args = process.argv.slice(2);
const base = (args.find((a) => /^https?:\/\//.test(a)) ?? "http://localhost:8080").replace(/\/+$/, "");
const [email = "admin@esd.local", password = PASSWORDS[email]] = args.filter((a) => !/^https?:\/\//.test(a));

try {
  const res = await fetch(`${base}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || typeof body?.accessToken !== "string") {
    console.error(`Login as ${email} failed: HTTP ${res.status} ${body ? JSON.stringify(body) : ""}`);
    process.exit(1);
  }
  console.log(body.accessToken);
} catch (error) {
  console.error(`Can't reach ${base} (${error.cause?.code || error.message}). Is the backend running?`);
  process.exit(1);
}
