// Stretch, section 10: decodeJwtPayload (src/auth/decodeJwt.js) — reading a JWT's payload,
// for display only.
import { describe, expect, test } from "vitest";
import { decodeJwtPayload } from "../../src/auth/decodeJwt.js";
import { ASHA, CLIENT_ID, signIdToken } from "../support/google.js";

const b64url = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const jwt = (payload) => `${b64url({ alg: "RS256", typ: "JWT" })}.${b64url(payload)}.c2lnbmF0dXJl`;

describe("10 · stretch — decodeJwtPayload", () => {
  test("returns the payload of a Google ID token as an object", () => {
    const claims = decodeJwtPayload(signIdToken());
    expect(claims).toMatchObject({ iss: "https://accounts.google.com", aud: CLIENT_ID, email: ASHA.email, email_verified: true, name: ASHA.name });
    expect(typeof claims.exp).toBe("number");
  });

  test("handles base64url: - and _ instead of + and /, and no = padding", () => {
    // ">>>" and "???" encode to "+" and "/" in base64 — so to "-" and "_" in base64url.
    const payload = { a: ">>>", b: "???", pad: "x" };
    const token = jwt(payload);
    expect(token.split(".")[1]).toMatch(/[-_]/);
    expect(token).not.toContain("=");
    expect(decodeJwtPayload(token)).toEqual(payload);
  });

  test("handles names that aren't plain ASCII (UTF-8): Zoë, आशा", () => {
    expect(decodeJwtPayload(jwt({ name: "Zoë Ñúñez" })).name).toBe("Zoë Ñúñez");
    expect(decodeJwtPayload(jwt({ name: "आशा राव" })).name).toBe("आशा राव");
  });

  test("decoding is NOT verifying: a token with a made-up signature decodes just the same", () => {
    const forged = jwt({ iss: "https://accounts.google.com", aud: CLIENT_ID, email: "admin@esd.local" });
    expect(decodeJwtPayload(forged).email).toBe("admin@esd.local"); // so never trust what it says
  });

  test("a string that isn't three dot-separated parts throws", () => {
    expect(() => decodeJwtPayload("not-a-jwt")).toThrow();
  });
});
