// Level D — POST /api/auth/google. Only what can be checked without a real Google
// sign-in: bad requests are 400, and every token Google didn't issue for this app is 401.
// (A real Google token needs a browser; the OAuth2 lab checks that end to end.)
import { generateKeyPairSync, createSign, createHmac, randomBytes } from "node:crypto";
import { createGroup, expectApiError, b64url } from "./lib.js";

const now = () => Math.floor(Date.now() / 1000);
const googleClaims = (aud) => ({
  iss: "https://accounts.google.com", aud, azp: aud, sub: "109876543210987654321",
  email: "someone@gmail.com", email_verified: true, name: "Some One", iat: now(), exp: now() + 3600,
});

export default function levelD(ctx) {
  const t = createGroup("D", "Google sign-in");
  const { api } = ctx;
  const google = (idToken) => api.post("/api/auth/google", { body: { idToken } });

  t.check("D01", "POST /api/auth/google with {} → 400 \"Validation failed\", fieldErrors.idToken", async () => {
    expectApiError(await api.post("/api/auth/google", { body: {} }), 400, { fields: ["idToken"] });
  });

  t.check("D02", "a blank idToken (\"\" or spaces) → 400 \"Validation failed\"", async () => {
    expectApiError(await google(""), 400, { fields: ["idToken"] });
    expectApiError(await google("   "), 400, { fields: ["idToken"] });
  });

  t.check("D03", "malformed JSON → 400, fieldErrors null", async () => {
    expectApiError(await api.post("/api/auth/google", { raw: '{"idToken": ' }), 400);
  });

  t.check("D04", "an idToken that isn't a JWT → 401", async () => {
    expectApiError(await google("not-a-google-token"), 401);
  });

  t.check("D05", "a forged HS256 token with Google's claims → 401", async () => {
    const head = b64url({ alg: "HS256", typ: "JWT" });
    const body = b64url(googleClaims("conformance.apps.googleusercontent.com"));
    const sig = createHmac("sha256", randomBytes(32)).update(`${head}.${body}`).digest("base64url");
    expectApiError(await google(`${head}.${body}.${sig}`), 401);
  });

  t.check("D06", "a self-signed RS256 token (a key that isn't Google's) → 401", async () => {
    const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    const head = b64url({ alg: "RS256", typ: "JWT", kid: `conformance-${ctx.run}` });
    const body = b64url(googleClaims("conformance.apps.googleusercontent.com"));
    const sig = createSign("RSA-SHA256").update(`${head}.${body}`).sign(privateKey).toString("base64url");
    expectApiError(await google(`${head}.${body}.${sig}`), 401);
  });

  t.check("D07", "an unsigned token (\"alg\": \"none\") → 401", async () => {
    const token = `${b64url({ alg: "none", typ: "JWT" })}.${b64url(googleClaims("conformance.apps.googleusercontent.com"))}.`;
    expectApiError(await google(token), 401);
  });

  return t;
}
