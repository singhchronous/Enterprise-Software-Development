// The API client — GIVEN: React Lab 2's, with ONE CHANGE for this lab: the `token`
// option (section 09). Read it; don't edit it.
//
// The one place this app talks to the course API (openapi.yaml). Every other file calls
// apiFetch, so the base URL, JSON, the token and the error shape are handled here, once.
//
//   const courses = await apiFetch("/api/courses");                                 // GET, public
//   const me      = await apiFetch("/api/users/me", { token });                     // GET, logged in
//   const course  = await apiFetch("/api/courses", { method: "POST", body, token }); // POST, ADMIN
//
// - token: the logged-in user's JWT (from useAuth()). When given, it is sent as
//   `Authorization: Bearer <token>`; without it, no Authorization header is sent at all.
//   In Lab 2 this file logged in as the admin behind your back; now whoever calls apiFetch
//   passes the token of whoever is actually logged in.
// - Resolves with the parsed JSON body (null for a 204, which has no body).
// - Any non-2xx status throws an ApiError built from the contract's error body:
//   error.status (409), error.message ("Course code already exists"), and
//   error.fieldErrors ({ code: "must be …" } for a 400 validation error, otherwise null).
// - No response at all (server down, wrong port) is fetch's own TypeError
//   ("Failed to fetch"); it is not caught here, so it reaches you unchanged.

// "" means "the same origin as the app": npm run dev serves the mock API at /api.
const BASE = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  constructor(status, message, fieldErrors = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;           // the HTTP status, e.g. 400, 401, 403, 409
    this.fieldErrors = fieldErrors; // { field: "reason" } for a 400 validation error, else null
  }
}

export async function apiFetch(path, { method = "GET", body, token } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) throw await toApiError(res);
  return res.status === 204 ? null : res.json();
}

// Every error response has the same shape (ApiError in openapi.yaml). If the body isn't
// JSON — an HTML error page from a wrong URL, say — fall back to "HTTP 404".
async function toApiError(res) {
  let data = null;
  try {
    data = await res.json();
  } catch {
    // not JSON; keep data = null
  }
  return new ApiError(res.status, data?.message ?? `HTTP ${res.status}`, data?.fieldErrors ?? null);
}
