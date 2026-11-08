// Given — don't edit. A pretend Google, for the tests. Real Google can't take part in a
// test (it needs a person, a browser and the internet), so this plays both of its parts:
//
// 1. Google the token issuer: an RSA key pair made fresh for each test file. signIdToken()
//    signs ID tokens with the private key, exactly as Google signs them (RS256, with a kid);
//    JWKS is the public half, which stubFetch() serves at Google's real certs URL — so the
//    mock API's verifier (mock/google.js) checks these tokens with the very code it uses on
//    real ones. A token signed with any other key fails, as a forgery would.
//
// 2. Google Identity Services in the page: fakeGoogle() puts a window.google on the page with
//    the GIS functions your code calls. Its renderButton draws a plain <button> "Sign in with
//    Google" into the element you pass; clicking it is "the user chose their account": the
//    callback you gave initialize() gets { credential: <a signed ID token>, select_by: "btn" }.
import { createSign, generateKeyPairSync, randomUUID } from "node:crypto";
import { vi } from "vitest";

export const CLIENT_ID = "123456789012-esdtest.apps.googleusercontent.com";
export const KID = "esd-test-key";
export const ASHA = { email: "asha.rao@example.com", name: "Asha Rao" };

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
export const JWKS = { keys: [{ ...publicKey.export({ format: "jwk" }), kid: KID, alg: "RS256", use: "sig" }] };

const b64url = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const now = () => Math.floor(Date.now() / 1000);

// The claims Google puts in an ID token for Asha, signing in to CLIENT_ID. Override any of them.
export function googleClaims(overrides = {}) {
  const iat = now();
  return {
    iss: "https://accounts.google.com", azp: CLIENT_ID, aud: CLIENT_ID, sub: "104412345678901234567",
    email: ASHA.email, email_verified: true, nbf: iat - 30, name: ASHA.name, given_name: "Asha",
    family_name: "Rao", iat, exp: iat + 3600, jti: randomUUID(), ...overrides,
  };
}

// A signed ID token. Options: { key } another private key (a forgery), { header } extra header fields.
export function signIdToken(overrides = {}, { key = privateKey, header = {} } = {}) {
  const head = b64url({ alg: "RS256", kid: KID, typ: "JWT", ...header });
  const body = b64url(googleClaims(overrides));
  const signature = createSign("RSA-SHA256").update(`${head}.${body}`).sign(key).toString("base64url");
  return `${head}.${body}.${signature}`;
}

// window.google, as Google's script would leave it. Returns google.accounts.id, whose
// functions are vi.fn()s the tests can inspect. Set `.nextCredential` to choose what the
// next click on the button hands over (default: a fresh, valid token for Asha).
export function fakeGoogle() {
  const id = {
    config: null, // what the LAST initialize() was given — GIS keeps only the last one
    nextCredential: null,
    initialize: vi.fn((config) => {
      id.config = config;
    }),
    renderButton: vi.fn((parent) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = "Sign in with Google";
      button.addEventListener("click", () => {
        id.config.callback({ credential: id.nextCredential ?? signIdToken(), select_by: "btn" });
      });
      parent.append(button);
    }),
    prompt: vi.fn(),
    cancel: vi.fn(),
    disableAutoSelect: vi.fn(),
  };
  window.google = { accounts: { id } };
  return id;
}

// The <script> that loadGoogle() added to the page, if any.
export const gsiScript = () => document.head.querySelector('script[src="https://accounts.google.com/gsi/client"]');
