// The small toolkit every check uses: an HTTP client, assertions that explain
// themselves, and the shapes from openapi.yaml. No dependencies — Node 20+ only.
import { Buffer } from "node:buffer";

export const REASONS = {
  400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found",
  405: "Method Not Allowed", 409: "Conflict", 415: "Unsupported Media Type", 500: "Internal Server Error",
};
export const ORIGIN = "http://localhost:5173";
export const MISSING_ID = "999999999";

// A failed check: what we expected, and the response that disagreed (if any).
export class Failure extends Error {
  constructor(expected, res = null, hint = null) {
    super(expected);
    this.expected = expected;
    this.res = res;
    this.hint = hint;
  }
}

// ---- HTTP -------------------------------------------------------------------

// call("GET", "/api/courses", { user, body, raw, auth, headers })
//   user  { email, token }      sends Authorization: Bearer <token>
//   auth  "Basic abc"           sends exactly this Authorization header
//   body  object                sent as JSON
//   raw   string                sent as-is with Content-Type: application/json ("" = no body)
export function createClient(base) {
  async function call(method, path, { user, auth, body, raw, headers = {} } = {}) {
    const init = { method, headers: { Accept: "application/json", ...headers } };
    if (user) init.headers.Authorization = `Bearer ${user.token}`;
    if (auth !== undefined) init.headers.Authorization = auth;
    if (raw !== undefined) {
      init.headers["Content-Type"] = "application/json";
      if (raw !== "") init.body = raw;
    } else if (body !== undefined) {
      init.headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }
    let response;
    try {
      response = await fetch(base + path, { ...init, signal: AbortSignal.timeout(20000) });
    } catch (error) {
      const why = error.name === "TimeoutError" ? "no answer within 20 seconds" : (error.cause?.code || error.message);
      throw new Failure(`an HTTP response to ${method} ${path}`, null, `The request failed: ${why}. Is the backend still running?`);
    }
    const text = await response.text();
    let json;
    try { json = text === "" ? undefined : JSON.parse(text); } catch { json = undefined; }
    return {
      method, path, as: user?.email ?? (auth !== undefined ? `Authorization: ${auth || "(empty)"}` : null),
      status: response.status, headers: response.headers, text, json,
      sent: init.body,
    };
  }
  return {
    call,
    get: (path, opts) => call("GET", path, opts),
    post: (path, opts) => call("POST", path, opts),
    put: (path, opts) => call("PUT", path, opts),
    del: (path, opts) => call("DELETE", path, opts),
  };
}

// ---- small helpers -----------------------------------------------------------

export const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]00:?00)$/;
export const isUtcTimestamp = (v) => typeof v === "string" && UTC.test(v) && !Number.isNaN(Date.parse(v));
export const time = (v) => Date.parse(v);
export const pathOnly = (p) => p.split("?")[0];
export const show = (v) => JSON.stringify(v);

export function decodeJwt(token) {
  const parts = String(token).split(".");
  if (parts.length !== 3) return null;
  try {
    return { header: JSON.parse(Buffer.from(parts[0], "base64url")), claims: JSON.parse(Buffer.from(parts[1], "base64url")), parts };
  } catch {
    return null;
  }
}
export const b64url = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");

// ---- assertions ---------------------------------------------------------------

export function ok(condition, expected, res = null, hint = null) {
  if (!condition) throw new Failure(expected, res, hint);
}

export function expectStatus(res, ...codes) {
  if (codes.includes(res.status)) return;
  throw new Failure(`HTTP ${codes.join(" or ")}`, res, hintFor(res, codes));
}

export function expectJson(res) {
  const type = res.headers.get("content-type") || "";
  ok(type.includes("application/json"), `Content-Type: application/json (got ${type ? `"${type}"` : "none"})`, res, hintFor(res));
  ok(res.json !== undefined, "a JSON body", res, hintFor(res));
}

export function expectEmptyBody(res) {
  ok(res.text === "", `an empty body (HTTP ${res.status} has no content)`, res);
}

// Every non-2xx response: the ApiError shape, with the HTTP status repeated.
//   message:  a fixed message from the contract, compared exactly
//   fields:   a validation error — message "Validation failed" and these keys in fieldErrors
export function expectApiError(res, status, { message, fields } = {}) {
  expectStatus(res, status);
  expectJson(res);
  const body = res.json;
  ok(isObject(body), "an ApiError object as the body", res);
  for (const key of ["timestamp", "status", "error", "message", "path", "fieldErrors"]) {
    ok(key in body, `ApiError field "${key}" — all six fields are required, even when null`, res);
  }
  ok(body.status === status, `"status": ${status} (the HTTP status, repeated in the body)`, res);
  ok(body.error === REASONS[status], `"error": "${REASONS[status]}" (the HTTP reason phrase)`, res,
    typeof body.error === "string" && body.error.includes("_") ? "Use HttpStatus.getReasonPhrase(), not name()." : null);
  ok(typeof body.message === "string" && body.message.trim() !== "", `"message": a non-empty string`, res);
  ok(body.path === pathOnly(res.path), `"path": "${pathOnly(res.path)}" (the request path)`, res,
    typeof body.path === "string" && body.path.startsWith("uri=") ? "That's WebRequest.getDescription(false). Use HttpServletRequest.getRequestURI()." : null);
  ok(isUtcTimestamp(body.timestamp), `"timestamp": ISO-8601 in UTC, like "2026-01-15T09:30:00Z"`, res,
    "Use java.time.Instant. A LocalDateTime has no zone, so it has no Z at the end.");
  if (fields) {
    ok(body.message === "Validation failed", `"message": "Validation failed" (the fixed message for a validation error)`, res);
    ok(isObject(body.fieldErrors), `"fieldErrors": an object mapping each bad field to a reason`, res);
    for (const value of Object.values(body.fieldErrors)) ok(typeof value === "string", `every fieldErrors value to be a string`, res);
    const missing = fields.filter((f) => !(f in body.fieldErrors));
    ok(missing.length === 0, `fieldErrors to include ${fields.map((f) => `"${f}"`).join(", ")} (missing: ${missing.join(", ")})`, res);
  } else {
    ok(body.fieldErrors === null, `"fieldErrors": null (it is only for validation errors)`, res);
    if (message !== undefined) ok(body.message === message, `"message": "${message}" (a fixed message from the contract)`, res);
  }
}

const SPECS = {
  posInt: [(v) => Number.isInteger(v) && v > 0, "a positive integer"],
  int: [(v) => Number.isInteger(v), "an integer"],
  nonNegInt: [(v) => Number.isInteger(v) && v >= 0, "an integer ≥ 0"],
  string: [(v) => typeof v === "string", "a string"],
  nonEmpty: [(v) => typeof v === "string" && v !== "", "a non-empty string"],
  stringOrNull: [(v) => v === null || typeof v === "string", "a string or null"],
  timestamp: [isUtcTimestamp, `an ISO-8601 UTC timestamp, like "2026-01-15T09:30:00Z"`],
  role: [(v) => v === "STUDENT" || v === "ADMIN", `"STUDENT" or "ADMIN"`],
  bearer: [(v) => v === "Bearer", `"Bearer"`],
};
export const COURSE = { id: "posInt", code: "string", title: "string", description: "stringOrNull", department: "string", credits: "int", capacity: "int", seatsLeft: "nonNegInt" };
export const USER = { id: "posInt", email: "string", fullName: "string", role: "role", createdAt: "timestamp" };
export const LOGIN = { accessToken: "nonEmpty", tokenType: "bearer", expiresIn: "posInt" };
export const ENROLLMENT = { id: "posInt", course: COURSE, enrolledAt: "timestamp" };

export function expectShape(value, spec, what, res) {
  ok(isObject(value), `${what}: a JSON object`, res);
  for (const [key, type] of Object.entries(spec)) {
    ok(key in value, `${what}: a "${key}" field${type === "stringOrNull" ? " (required — send null when empty)" : ""}`, res);
    if (isObject(type)) {
      expectShape(value[key], type, `${what}.${key}`, res);
      continue;
    }
    const [test, description] = SPECS[type];
    ok(test(value[key]), `${what}: "${key}" to be ${description}, not ${show(value[key])}`, res,
      type === "timestamp" ? "Use java.time.Instant. A LocalDateTime has no zone, so it has no Z at the end." : null);
  }
}

export function expectUser(res, what = "the user") {
  expectShape(res.json, USER, what, res);
  const leaked = Object.keys(res.json).filter((k) => /pass|hash/i.test(k));
  ok(leaked.length === 0, `${what}: no password or hash field (found ${leaked.join(", ")})`, res, "Return a DTO, never the entity.");
}

export function expectSortedByCode(list, what, res) {
  for (let i = 1; i < list.length; i++) {
    const a = list[i - 1].code, b = list[i].code;
    ok(!(a > b), `${what} sorted by code ascending — but ${a} comes before ${b}`, res);
  }
}

// ---- hints for the usual Spring mistakes ---------------------------------------

function hintFor(res, wanted = []) {
  if (!res) return null;
  const text = res.text.trim();
  if (text.startsWith("<")) return "The body is HTML — probably Spring's Whitelabel error page. Handle this error in your @RestControllerAdvice and return an ApiError.";
  if ((res.status === 401 || res.status === 403) && text === "") return "An empty 401/403 comes from Spring Security's defaults. Give it an AuthenticationEntryPoint and an AccessDeniedHandler that write an ApiError.";
  if (res.status === 500 && /Exception|\tat |"trace"/.test(text)) return "A 500 with exception details. Something threw that your @RestControllerAdvice doesn't map to a 4xx.";
  if (wanted.includes(401) && res.status === 200) return "The endpoint answered without checking the token. Is it permitAll() in your SecurityConfig?";
  if (wanted.includes(401) && res.status === 400) return "Authentication must be checked before the body is validated: a bad body with no token is 401.";
  if (wanted.includes(400) && res.status === 500) return "Bad input reached the database or threw an exception. Validate it (@Valid on the body, and handle the exception) and return 400.";
  if (wanted.includes(403) && res.status === 401) return "The token is valid, so this is not 401. 403 means 'I know who you are, and you may not'.";
  if (res.status === 404 && wanted.some((c) => c >= 200 && c < 300)) return "Is the path exactly as in openapi.yaml, under /api?";
  return null;
}

// ---- the runner --------------------------------------------------------------------

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (code) => (s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);
export const green = paint("32"), red = paint("31"), dim = paint("2"), bold = paint("1"), yellow = paint("33");

function clip(s, n = 600) {
  return s.length > n ? s.slice(0, n) + ` … (${s.length - n} more characters)` : s;
}

export function formatFailure(failure) {
  const lines = [];
  const res = failure.res;
  if (res) {
    lines.push(`request   ${res.method} ${res.path}${res.as ? `   (${res.as})` : ""}`);
    if (res.sent !== undefined && res.sent !== "") lines.push(`sent      ${clip(String(res.sent), 200)}`);
  }
  lines.push(`expected  ${failure.expected}`);
  if (res) {
    const type = res.headers.get("content-type");
    lines.push(`received  HTTP ${res.status}${type ? `  ${type}` : ""}`);
    lines.push(`          ${res.text === "" ? "(empty body)" : clip(res.text)}`);
  }
  if (failure.hint) lines.push(`hint      ${failure.hint}`);
  return lines;
}

// One group of checks (a level, or CORS). Checks run in the order they're declared.
export function createGroup(key, name) {
  const checks = [];
  const cleanups = [];
  return {
    key, name, checks, cleanups,
    check(id, title, fn) { checks.push({ id, title, fn }); },
    cleanup(fn) { cleanups.push(fn); },
  };
}

export async function runGroup(group, log) {
  log("");
  log(bold(`${group.key === "CORS" ? "CORS" : `Level ${group.key}`} — ${group.name}`));
  const results = [];
  for (const check of group.checks) {
    let failure = null;
    try {
      await check.fn();
    } catch (error) {
      failure = error instanceof Failure ? error : new Failure("the check to run without crashing", null, `${error.stack || error}`);
    }
    results.push({ ...check, failure });
    if (!failure) {
      log(`  ${green("✓")} ${check.id}  ${check.title}`);
    } else {
      log(`  ${red("✗")} ${check.id}  ${check.title}`);
      for (const line of formatFailure(failure)) log(dim(`        ${line}`));
    }
  }
  for (const fn of group.cleanups) {
    try { await fn(); } catch (error) { log(yellow(`  ! cleanup: ${error.message}${error.hint ? ` — ${error.hint}` : ""}`)); }
  }
  return results;
}
