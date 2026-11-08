# Audit — OAuth lab, in-lab task

Part of what you submit. Fill in parts 1–3 **before** you run the AI's code: deciding what's
wrong is your job, not the AI's. Section 11 of the doc is what you audit against, and
`test/google-verify.test.js` is the same list as tests. Point at code as `File.java:line`.

---

## 0. Prompt log

- AI tool used: (e.g. ChatGPT free, Claude, Gemini, Copilot)
- Prompts, in order — paste each one, and say which files you attached:
  1. (the constraint prompt + your request)
  2. …

## 1. Is the verification complete?

The question from Spring Boot Lab 2's audit, now for a token Google signed. For each check:
where is it, and how is it done? "Missing" is a valid answer — then say what you added.

| Check | Where (`File.java:line`), or "missing" | How, in one line |
| --- | --- | --- |
| **Signature** — RS256, against the keys at `https://www.googleapis.com/oauth2/v3/certs` |  |  |
| **Only RS256** — `"alg": "none"` and an HS256 token are refused |  |  |
| **Expiry** — `exp` is checked. (Did the code call `setJwtValidator(...)`? That *replaces* the defaults — is a `JwtTimestampValidator` still in the list?) |  |  |
| **Issuer** — `accounts.google.com` **and** `https://accounts.google.com` both accepted, nothing else |  |  |
| **Audience** — `aud` contains `app.google.client-id` (read from the property, not hard-coded) |  |  |
| **email_verified** is `true` |  |  |
| **Identity from the verified token** — the email and name come from the decoded `Jwt`, never from the request body |  |  |

## 2. What happens after verifying

| Requirement | Where, or "missing" | OK? |
| --- | --- | --- |
| Find by email, trimmed and lowercased; an existing account is reused |  |  |
| A new account is `STUDENT`, with no password (and password login refuses a null hash) |  |  |
| The answer is your login's: `{ accessToken, tokenType, expiresIn }` with **your** JWT — not Google's token passed back |  |  |
| Every failure is a **401** `ApiError` — not a 500, not a 403, not Spring's empty 401 |  |  |
| `idToken` missing or blank → 400 `Validation failed` with `fieldErrors.idToken` |  |  |
| `POST /api/auth/google` is `permitAll` — and nothing else was opened up |  |  |
| `app.google.client-id` is in `application.properties`, same value as `oauth-lab/.env` |  |  |

## 3. What must NOT be there

Search the AI's files for each. Found → where, and cut it (or say why it stays).

| Not wanted | Found? (`File.java:line`) | Cut / keep — why |
| --- | --- | --- |
| `spring-boot-starter-oauth2-client`, `oauth2Login()`, a client secret, a redirect URI |  |  |
| A call to `oauth2.googleapis.com/tokeninfo` |  |  |
| Decoding without verifying (`split(".")`, `Base64`, a "decode" that never checks the signature) |  |  |
| `JwtDecoders.fromIssuerLocation(...)` — checks the issuer, **not the audience** |  |  |
| The Google decoder declared as a `@Bean JwtDecoder` (it can replace, or clash with, the decoder for your own tokens) |  |  |
| `@Transactional` around the call to Google |  |  |
| The whole token written to the log |  |  |
| A library or annotation nobody taught you (name it) |  |  |

## 4. Proof by running

- `npm run conformance -- --level D` — paste the last two lines here; the full output is in
  `inlab/conformance.txt`:

  ```
  ```

- **The audience check, tried:** with `app.google.client-id` set to a wrong value, a real
  sign-in gave: (status and message)
- **A real sign-in against your backend:** `inlab/signed-in.png` — your Google name in the
  header, and the Network tab showing `POST …:8080/api/auth/google` → 200.
- **Replay:** copy the `idToken` from that request (Network tab → Payload) and send it again a
  few minutes later, from the console (section 15 shows how). What did your backend answer, and
  why? What stops it working tomorrow?

## 5. One thing the AI got wrong or left out — and how you noticed

(If it got nothing wrong: which row above took you longest to confirm, and how did you confirm it?)
