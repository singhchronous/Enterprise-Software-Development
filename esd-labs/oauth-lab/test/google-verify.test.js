// Section 05 — GIVEN, and passing from the start: nothing to write here. READ it.
//
// What "verify a Google ID token completely" means, as tests: the mock API's verifier
// (mock/google.js) must accept a token Google signed for THIS app, and refuse every other
// kind. Your Spring Boot verifier (section 11) must make exactly the same decisions —
// this is the list you audit it against in the lab (section 14).
//
// The keys here are the pretend Google's (support/google.js), passed in as { keys }; in the
// browser and in your backend, the keys come from https://www.googleapis.com/oauth2/v3/certs.
import { generateKeyPairSync, createHmac, randomBytes } from "node:crypto";
import { describe, expect, test } from "vitest";
import { verifyGoogleIdToken } from "../mock/google.js";
import { CLIENT_ID, JWKS, ASHA, signIdToken } from "./support/google.js";

const verify = (token, clientId = CLIENT_ID) => verifyGoogleIdToken(token, clientId, { keys: JWKS.keys });
const now = () => Math.floor(Date.now() / 1000);
const b64url = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");

describe("05 · A Google ID token is accepted only if every check passes", () => {
  test("accepted: signed by Google's key, for this app, by Google, not expired → the claims", async () => {
    const claims = await verify(signIdToken());
    expect(claims).toMatchObject({ email: ASHA.email, name: ASHA.name, aud: CLIENT_ID, iss: "https://accounts.google.com" });
  });

  test("accepted: Google's other spelling of the issuer, \"accounts.google.com\"", async () => {
    expect(await verify(signIdToken({ iss: "accounts.google.com" }))).not.toBeNull();
  });

  test("refused — audience: a genuine Google token, but minted for ANOTHER app", async () => {
    expect(await verify(signIdToken({ aud: "someone-elses-app.apps.googleusercontent.com" }))).toBeNull();
  });

  test("refused — audience: our token, checked by a server configured with another client ID", async () => {
    expect(await verify(signIdToken(), "a-different-client-id.apps.googleusercontent.com")).toBeNull();
  });

  test("refused — issuer: correctly signed, but iss isn't Google", async () => {
    expect(await verify(signIdToken({ iss: "https://evil.example.com" }))).toBeNull();
    expect(await verify(signIdToken({ iss: "google.com" }))).toBeNull();
  });

  test("refused — expiry: exp is in the past (a token captured earlier, replayed)", async () => {
    expect(await verify(signIdToken({ iat: now() - 7200, exp: now() - 3600 }))).toBeNull();
  });

  test("refused — signature: signed with a key that isn't Google's (a forgery)", async () => {
    const { privateKey: someoneElses } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    expect(await verify(signIdToken({}, { key: someoneElses }))).toBeNull();
  });

  test("refused — signature: the payload was edited after signing (another email pasted in)", async () => {
    const [head, body, signature] = signIdToken().split(".");
    const edited = b64url({ ...JSON.parse(Buffer.from(body, "base64url")), email: "admin@esd.local" });
    expect(await verify(`${head}.${edited}.${signature}`)).toBeNull();
  });

  test("refused — \"alg\": \"none\" (no signature at all) and HS256 (a shared-secret forgery)", async () => {
    const body = b64url({ iss: "https://accounts.google.com", aud: CLIENT_ID, email: ASHA.email, email_verified: true, exp: now() + 3600 });
    expect(await verify(`${b64url({ alg: "none", typ: "JWT" })}.${body}.`)).toBeNull();
    const head = b64url({ alg: "HS256", typ: "JWT" });
    const sig = createHmac("sha256", randomBytes(32)).update(`${head}.${body}`).digest("base64url");
    expect(await verify(`${head}.${body}.${sig}`)).toBeNull();
  });

  test("refused — a key id (kid) Google never published", async () => {
    expect(await verify(signIdToken({}, { header: { kid: "not-a-google-key" } }))).toBeNull();
  });

  test("refused — the email isn't verified (so it isn't proof of anything)", async () => {
    expect(await verify(signIdToken({ email_verified: false }))).toBeNull();
  });

  test("refused — no email_verified claim at all: only a verified email counts", async () => {
    expect(await verify(signIdToken({ email_verified: undefined }))).toBeNull();
  });

  test("clock skew: 60 seconds either way are allowed, as in Spring — not more", async () => {
    expect(await verify(signIdToken({ exp: now() - 30 }))).not.toBeNull(); // expired 30 s ago: allowed
    expect(await verify(signIdToken({ exp: now() - 120 }))).toBeNull(); // 2 minutes ago: refused
    expect(await verify(signIdToken({ nbf: now() + 30 }))).not.toBeNull(); // "not before" 30 s from now: allowed
    expect(await verify(signIdToken({ nbf: now() + 120 }))).toBeNull(); // 2 minutes from now: refused
  });

  test("refused — not a JWT at all", async () => {
    expect(await verify("not-a-google-token")).toBeNull();
    expect(await verify("")).toBeNull();
  });
});
