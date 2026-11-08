// CORS — what a browser needs before it lets a React app at http://localhost:5173 read
// your API's responses. Checked separately from the levels: React Lab 4 is where you
// point a browser at your own backend, and that lab teaches CORS. Until then, expect ✗.
import { createGroup, expectStatus, ok, ORIGIN, MISSING_ID } from "./lib.js";

const list = (header) => (header || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
const HINT = "Configure CORS for http://localhost:5173 in Spring Security (http.cors(...)) — React Lab 4 shows how.";

export default function cors(ctx) {
  const t = createGroup("CORS", "Browser access from http://localhost:5173");
  const { api } = ctx;

  async function preflight(path, method, headers) {
    const res = await api.call("OPTIONS", path, {
      headers: { Origin: ORIGIN, "Access-Control-Request-Method": method, "Access-Control-Request-Headers": headers },
    });
    ok(res.status === 200 || res.status === 204, "HTTP 200 or 204 to the preflight (an OPTIONS request without a token)", res, HINT);
    const allowOrigin = res.headers.get("access-control-allow-origin");
    ok(allowOrigin === ORIGIN || allowOrigin === "*", `Access-Control-Allow-Origin: ${ORIGIN} (got ${allowOrigin ?? "none"})`, res, HINT);
    const methods = list(res.headers.get("access-control-allow-methods"));
    ok(methods.includes("*") || methods.includes(method.toLowerCase()), `Access-Control-Allow-Methods to include ${method} (got "${res.headers.get("access-control-allow-methods") ?? ""}")`, res, HINT);
    const allowed = list(res.headers.get("access-control-allow-headers"));
    for (const h of list(headers)) {
      ok(allowed.includes("*") || allowed.includes(h), `Access-Control-Allow-Headers to include ${h} (got "${res.headers.get("access-control-allow-headers") ?? ""}")`, res, HINT);
    }
  }

  async function actual(path) {
    const res = await api.get(path, { headers: { Origin: ORIGIN } });
    const allowOrigin = res.headers.get("access-control-allow-origin");
    ok(allowOrigin === ORIGIN || allowOrigin === "*", `Access-Control-Allow-Origin: ${ORIGIN} on the HTTP ${res.status} response (got ${allowOrigin ?? "none"})`, res, HINT);
    return res;
  }

  t.check("X01", "preflight: GET /api/courses with an Authorization header → allowed", async () => {
    await preflight("/api/courses", "GET", "authorization");
  });
  t.check("X02", "preflight: POST /api/courses with Authorization and Content-Type → allowed", async () => {
    await preflight("/api/courses", "POST", "authorization,content-type");
  });
  t.check("X03", "preflight: PUT /api/courses/1 → allowed", async () => {
    await preflight("/api/courses/1", "PUT", "authorization,content-type");
  });
  t.check("X04", "preflight: POST /api/enrollments → allowed (a preflight carries no token, so it must not be 401)", async () => {
    await preflight("/api/enrollments", "POST", "authorization,content-type");
  });
  t.check("X05", "preflight: DELETE /api/enrollments/1 → allowed", async () => {
    await preflight("/api/enrollments/1", "DELETE", "authorization");
  });
  t.check("X06", "GET /api/courses from the app's origin → the response carries Access-Control-Allow-Origin", async () => {
    expectStatus(await actual("/api/courses"), 200);
  });
  t.check("X07", "an error response carries it too (404), so the app can read the ApiError", async () => {
    expectStatus(await actual(`/api/courses/${MISSING_ID}`), 404);
  });
  t.check("X08", "a 401 from the security layer carries it too", async () => {
    await actual("/api/users/me");
  });

  return t;
}
