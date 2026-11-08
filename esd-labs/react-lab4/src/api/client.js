// The API client — the one place this app talks to the course API (openapi.yaml).
// GIVEN from React Lab 3, with THREE CHANGES for this lab:
//   - API_BASE drops a trailing slash, and is exported (the footer shows it) — section 09
//   - no answer at all becomes a NetworkError with a clear message        — section 03 (you)
//   - a 401 on a request that carried a token calls onUnauthorized()      — section 05 (you)
//
//   const courses = await apiFetch("/api/courses");                                  // GET, public
//   const me      = await apiFetch("/api/users/me", { token });                      // GET, logged in
//   const course  = await apiFetch("/api/courses", { method: "POST", body, token });  // POST, ADMIN
//
// Inside the app you rarely call apiFetch with a token yourself: useAuth().api does it for
// you, with the token and onUnauthorized already filled in (section 05).
//
// - token: the logged-in user's JWT. When given, it is sent as `Authorization: Bearer <token>`;
//   without it, no Authorization header is sent at all.
// - onUnauthorized: a function, called when a request that carried a token gets 401 — the
//   token expired, or was logged out. It is called just before the ApiError is thrown.
// - Resolves with the parsed JSON body (null for a 204, which has no body).
// - Any non-2xx status throws an ApiError built from the contract's error body:
//   error.status (409), error.message ("Course is full"), and
//   error.fieldErrors ({ email: "must be …" } for a 400 validation error, otherwise null).
// - No response at all (server down, wrong port, blocked by CORS) throws a NetworkError.

// "" means "the same origin as the app": npm run dev serves the mock API at /api.
// With VITE_API_URL=http://localhost:8080 in .env.local, every request goes to your backend.
// A trailing slash is dropped, so "http://localhost:8080/" doesn't make "…8080//api/courses".
export const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(status, message, fieldErrors = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;           // the HTTP status, e.g. 400, 401, 403, 409
    this.fieldErrors = fieldErrors; // { field: "reason" } for a 400 validation error, else null
  }
}

// The server never answered. `cause` keeps the browser's own error ("Failed to fetch").
export class NetworkError extends Error {
  constructor(cause) {
    super("Can't reach the server — is your backend running?");
    this.name = "NetworkError";
    this.cause = cause;
  }
}

export async function apiFetch(path, { method = "GET", body, token, onUnauthorized } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  const init = { method, headers, body: body === undefined ? undefined : JSON.stringify(body) };

  // TODO (section 03): when fetch itself rejects (no response at all), throw a
  // NetworkError instead of letting fetch's TypeError ("Failed to fetch") through.
  const res = await fetch(`${API_BASE}${path}`, init);

  if (!res.ok) {
    const error = await toApiError(res);
    // TODO (section 05): a 401 on a request that carried a token → call onUnauthorized()
    // (if it was given) before throwing.
    throw error;
  }
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
