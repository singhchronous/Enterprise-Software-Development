// Level B — accounts: signup, login, GET /api/users/me, logout, and the 401 rules.
import { createGroup, expectStatus, expectJson, expectShape, expectApiError, expectUser, expectEmptyBody, ok, show, decodeJwt, b64url, LOGIN } from "./lib.js";
import { SEED, PASSWORDS } from "./context.js";

export default function levelB(ctx) {
  const t = createGroup("B", "Accounts");
  const { api } = ctx;
  const ADMIN = "admin@esd.local", STUDENT = "student@esd.local", RIYA = "riya@esd.local";
  const AUTH_REQUIRED = "Authentication required";
  const BAD_LOGIN = "Invalid email or password";
  let newUser = null; // signed up in B08

  t.check("B01", "the three seeded users can log in → 200 { accessToken, tokenType: \"Bearer\", expiresIn }", async () => {
    for (const email of [ADMIN, STUDENT, RIYA]) {
      const res = await api.post("/api/auth/login", { body: { email, password: PASSWORDS[email] } });
      expectStatus(res, 200);
      expectJson(res);
      expectShape(res.json, LOGIN, "the login response", res);
      ctx.users[email] = { email, password: PASSWORDS[email], token: res.json.accessToken, res };
    }
  });

  t.check("B02", "the token is a JWT with sub, role, jti, iat, exp — and exp − iat = expiresIn", async () => {
    for (const email of [ADMIN, STUDENT]) {
      const user = await ctx.seeded(email);
      const res = user.res;
      const jwt = decodeJwt(user.token);
      ok(jwt, "accessToken to be a JWT: three base64url parts separated by dots", res);
      const c = jwt.claims;
      ok(c.sub === email, `the "sub" claim to be the email ${show(email)}, not ${show(c.sub)}`, res);
      const role = SEED.users.find((u) => u.email === email).role;
      ok(c.role === role, `the "role" claim to be ${show(role)}, not ${show(c.role)}`, res);
      ok(typeof c.jti === "string" && c.jti !== "", `a "jti" claim (a unique token id — logout revokes it)`, res);
      ok(Number.isInteger(c.iat) && Number.isInteger(c.exp), `"iat" and "exp" claims in whole seconds`, res);
      ok(c.exp - c.iat === res.json.expiresIn, `expiresIn (${res.json.expiresIn}) = exp − iat (${c.exp - c.iat})`, res);
    }
  });

  t.check("B03", "GET /api/users/me → 200, the logged-in user (and never a password)", async () => {
    for (const email of [ADMIN, RIYA]) {
      const user = await ctx.seeded(email);
      const res = await api.get("/api/users/me", { user });
      expectStatus(res, 200);
      expectJson(res);
      expectUser(res);
      const seed = SEED.users.find((u) => u.email === email);
      ok(res.json.email === email, `email ${show(email)}`, res);
      ok(res.json.role === seed.role, `role ${show(seed.role)}`, res);
      ok(res.json.fullName === seed.fullName, `fullName ${show(seed.fullName)}`, res);
    }
  });

  t.check("B04", "login with a wrong password → 401 \"Invalid email or password\"", async () => {
    const res = await api.post("/api/auth/login", { body: { email: STUDENT, password: "wrong-password" } });
    expectApiError(res, 401, { message: BAD_LOGIN });
  });

  t.check("B05", "login with an unknown email → the same 401 (it never reveals which emails exist)", async () => {
    const res = await api.post("/api/auth/login", { body: { email: ctx.email("nobody"), password: "whatever123" } });
    expectApiError(res, 401, { message: BAD_LOGIN });
  });

  t.check("B06", "login with {} → 400 \"Validation failed\", fieldErrors for email and password", async () => {
    expectApiError(await api.post("/api/auth/login", { body: {} }), 400, { fields: ["email", "password"] });
  });

  t.check("B07", "login with malformed JSON → 400, fieldErrors null", async () => {
    expectApiError(await api.post("/api/auth/login", { raw: '{"email": "student@esd.local",' }), 400);
  });

  t.check("B08", "signup → 201, a STUDENT; then that account can log in", async () => {
    const email = ctx.email("new");
    const password = `pw-${ctx.run}-new`;
    const res = await api.post("/api/auth/signup", { body: { email, password, fullName: "Asha Conformance" } });
    expectStatus(res, 201);
    expectJson(res);
    expectUser(res, "the new user");
    ok(res.json.email === email, `email ${show(email)}`, res);
    ok(res.json.fullName === "Asha Conformance", `fullName "Asha Conformance"`, res);
    ok(res.json.role === "STUDENT", `role "STUDENT"`, res);
    newUser = await ctx.login(email, password);
    const me = await api.get("/api/users/me", { user: newUser });
    expectStatus(me, 200);
    ok(me.json?.id === res.json.id && me.json?.email === email, `/api/users/me to return the same user (id ${res.json.id})`, me);
  });

  t.check("B09", "signup ignores a \"role\": \"ADMIN\" in the body — the account is a STUDENT", async () => {
    const email = ctx.email("wants-admin");
    const password = `pw-${ctx.run}-wa`;
    const res = await api.post("/api/auth/signup", { body: { email, password, fullName: "Would-be Admin", role: "ADMIN" } });
    expectStatus(res, 201);
    ok(res.json?.role === "STUDENT", `role "STUDENT" (signup never creates an ADMIN), not ${show(res.json?.role)}`, res);
    const user = await ctx.login(email, password);
    ok(decodeJwt(user.token)?.claims.role === "STUDENT", `the token's role claim to be "STUDENT"`, user.res);
    ctx.users["wants-admin"] = user;
  });

  t.check("B10", "signup with an email that's taken → 409 (in any letter case)", async () => {
    expectApiError(await api.post("/api/auth/signup", { body: { email: STUDENT, password: "password123", fullName: "Copy Cat" } }), 409);
    const res = await api.post("/api/auth/signup", { body: { email: "Student@ESD.local", password: "password123", fullName: "Copy Cat" } });
    expectApiError(res, 409);
  });

  t.check("B11", "signup lowercases the email; login then works in any case", async () => {
    const mixed = `Conf-${ctx.run}-Mixed@Conformance.TEST`;
    const lower = mixed.toLowerCase();
    const res = await api.post("/api/auth/signup", { body: { email: mixed, password: "password123", fullName: "Mixed Case" } });
    expectStatus(res, 201);
    ok(res.json?.email === lower, `email stored as ${show(lower)}, not ${show(res.json?.email)}`, res);
    for (const email of [lower, mixed]) {
      const login = await api.post("/api/auth/login", { body: { email, password: "password123" } });
      expectStatus(login, 200);
    }
  });

  t.check("B12", "signup with {} → 400 \"Validation failed\", fieldErrors for email, password, fullName", async () => {
    expectApiError(await api.post("/api/auth/signup", { body: {} }), 400, { fields: ["email", "password", "fullName"] });
  });

  t.check("B13", "signup with bad values → 400, one fieldErrors entry per bad field", async () => {
    const res = await api.post("/api/auth/signup", { body: { email: "not-an-email", password: "short", fullName: "" } });
    expectApiError(res, 400, { fields: ["email", "password", "fullName"] });
    const long = await api.post("/api/auth/signup", { body: { email: ctx.email("long"), password: "x".repeat(65), fullName: "Long Password" } });
    expectApiError(long, 400, { fields: ["password"] });
  });

  t.check("B14", "signup with no body, or malformed JSON → 400, fieldErrors null", async () => {
    expectApiError(await api.post("/api/auth/signup", { raw: "" }), 400);
    expectApiError(await api.post("/api/auth/signup", { raw: "{not json" }), 400);
  });

  t.check("B15", "GET /api/users/me without a token → 401 \"Authentication required\"", async () => {
    expectApiError(await api.get("/api/users/me"), 401, { message: AUTH_REQUIRED });
  });

  t.check("B16", "a malformed Authorization header → 401 (Basic …, Bearer with no token, Token …)", async () => {
    for (const auth of ["Basic c3R1ZGVudEBlc2QubG9jYWw6c3R1ZGVudDEyMzQ1", "Bearer", "Token abc.def.ghi"]) {
      expectApiError(await api.get("/api/users/me", { auth }), 401, { message: AUTH_REQUIRED });
    }
  });

  t.check("B17", "a token that isn't a JWT → 401", async () => {
    expectApiError(await api.get("/api/users/me", { auth: "Bearer not-a-real-token" }), 401, { message: AUTH_REQUIRED });
  });

  t.check("B18", "a tampered token (payload changed to role ADMIN, old signature) → 401", async () => {
    const user = await ctx.seeded(STUDENT);
    const jwt = decodeJwt(user.token);
    ok(jwt, "the student's token to be a JWT (see B02)");
    const forged = [jwt.parts[0], b64url({ ...jwt.claims, role: "ADMIN" }), jwt.parts[2]].join(".");
    expectApiError(await api.get("/api/users/me", { auth: `Bearer ${forged}` }), 401, { message: AUTH_REQUIRED });
  });

  t.check("B19", "an unsigned token (\"alg\": \"none\") → 401", async () => {
    const now = Math.floor(Date.now() / 1000);
    const token = `${b64url({ alg: "none", typ: "JWT" })}.${b64url({ sub: ADMIN, role: "ADMIN", jti: `conf-${ctx.run}`, iat: now, exp: now + 3600 })}.`;
    expectApiError(await api.get("/api/users/me", { auth: `Bearer ${token}` }), 401, { message: AUTH_REQUIRED });
  });

  t.check("B20", "POST /api/auth/logout → 204 with an empty body", async () => {
    ok(newUser, "the account from B08 (B08 failed, so this can't run)");
    ctx.users["new-second"] = await ctx.login(newUser.email, newUser.password); // a second token, for B22
    const res = await api.post("/api/auth/logout", { user: newUser });
    expectStatus(res, 204);
    expectEmptyBody(res);
  });

  t.check("B21", "after logout, that token → 401 everywhere (it was revoked on the server)", async () => {
    ok(newUser, "the account from B08");
    expectApiError(await api.get("/api/users/me", { user: newUser }), 401, { message: AUTH_REQUIRED });
    expectApiError(await api.post("/api/auth/logout", { user: newUser }), 401, { message: AUTH_REQUIRED });
  });

  t.check("B22", "after logout, the same user's OTHER token still works", async () => {
    const other = ctx.users["new-second"];
    ok(other, "a second token from B20");
    const res = await api.get("/api/users/me", { user: other });
    expectStatus(res, 200);
  });

  t.check("B23", "POST /api/auth/logout without a token → 401", async () => {
    expectApiError(await api.post("/api/auth/logout"), 401, { message: AUTH_REQUIRED });
  });

  t.check("B24", "an unknown /api path → 404 ApiError (sent with a valid token)", async () => {
    const user = await ctx.seeded(STUDENT);
    expectApiError(await api.get(`/api/no-such-endpoint-${ctx.run}`, { user }), 404);
  });

  t.check("B25", "a known path with the wrong method → 405 ApiError, with an Allow header (sent with a valid token)", async () => {
    const user = await ctx.seeded(STUDENT);
    const cases = [["DELETE", "/api/users/me", ["GET"]], ["DELETE", "/api/courses", ["GET", "POST"]], ["PATCH", "/api/auth/login", ["POST"]]];
    for (const [method, path, allowed] of cases) {
      const res = await api.call(method, path, { user });
      expectApiError(res, 405);
      const allow = (res.headers.get("allow") || "").split(",").map((m) => m.trim().toUpperCase()).filter(Boolean);
      ok(allow.length > 0, `an Allow header listing the methods ${path} supports (${allowed.join(", ")})`, res,
        "In your handler for HttpRequestMethodNotSupportedException, copy ex.getSupportedHttpMethods() into the Allow header.");
      for (const m of allowed) ok(allow.includes(m), `Allow to include ${m} (got "${res.headers.get("allow")}")`, res);
      ok(!allow.includes(method), `Allow not to include ${method}, the method that was just refused`, res);
    }
  });

  return t;
}
