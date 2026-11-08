# In-lab task — Sign in with Google in YOUR backend, with AI, audited

For the lab session (section 14 of the doc). **AI-assisted:** you give an AI the constraint
prompt below, this contract slice and your own backend files; then you **audit** what comes
back with `AUDIT.md` — before you run it. The judge is the conformance suite (level D) plus a
real sign-in in the browser; neither alone is enough (section 12 says why).

Start only when:

- `npm test` is green here — the React side works against the mock;
- your backend passes `npm run conformance` (levels A–C **and** CORS) — React Lab 4's gate;
- you've read section 11 of the doc: it's what you judge the AI's code against.

## What to build — in your Spring Boot project

From the contract (`openapi.yaml` → `POST /api/auth/google`, in the `api-contract` folder):

```
POST /api/auth/google        no token needed (permitAll)
  body  { "idToken": "<the credential string Google Identity Services gave the browser>" }
  200   { "accessToken": "<YOUR API's JWT>", "tokenType": "Bearer", "expiresIn": 3600 }   ← same as /api/auth/login
  400   "Validation failed", fieldErrors.idToken      ← idToken missing or blank
  400   fieldErrors null                              ← body isn't valid JSON
  401   ApiError                                      ← token missing, invalid, expired, or issued for another app
```

1. **Verify the Google ID token completely:** the RS256 signature against Google's published
   keys (`https://www.googleapis.com/oauth2/v3/certs`), the expiry (`exp`), the issuer (`iss` is
   `accounts.google.com` **or** `https://accounts.google.com`), and the audience (`aud` is this
   app's client ID, from the property `app.google.client-id`). Also: `email_verified` is true.
2. **Find or create the user** by the token's email (trimmed, lowercased). A new account is
   always a `STUDENT`, named from the token's `name` (or the email), with **no password**.
3. **Answer exactly as `/api/auth/login` does** — with your own JWT, from your existing token code.
4. **Any failure → 401** in your `ApiError` shape (e.g. `"Invalid Google token"`).
5. **Config:** `app.google.client-id=<the value of VITE_GOOGLE_CLIENT_ID in oauth-lab/.env>` in
   `application.properties`. The client ID is public; it's fine in the file. There is **no**
   client secret in this flow.

## Attach to your prompt

This file, and from your backend: `pom.xml`, your `SecurityConfig`, the controller and service
where `/api/auth/login` lives, your `User` entity and its repository, the class that issues your
JWTs, and your exception class + `@RestControllerAdvice`. Nothing else.

## The constraint prompt (paste it first, unchanged)

> You are helping a student add one endpoint to their existing Spring Boot 3 backend (Java 17),
> which already has password login that issues its own JWTs. Implement `POST /api/auth/google`
> exactly as the attached contract says. Verify the Google ID token with Spring Security's
> `NimbusJwtDecoder` (from `spring-boot-starter-oauth2-resource-server`) and Google's JWK set at
> `https://www.googleapis.com/oauth2/v3/certs`. Do not use `spring-boot-starter-oauth2-client`,
> `oauth2Login()`, a client secret, a redirect URI, sessions or cookies. Do not call Google's
> tokeninfo endpoint. Do not add any other library. Reuse my existing User entity, repository,
> token-issuing code, error handling and SecurityConfig, and change nothing that this endpoint
> doesn't need. New accounts are always STUDENT. Show each file you change in full, and list
> every dependency you add.

## Then

1. **Audit before you run** — `AUDIT.md`, parts 1–3. Fix what's wrong (by hand, or with a
   follow-up prompt — log it).
2. **Run the suite** from the `api-contract` folder, with your backend running:
   `npm run conformance -- --level D > ../oauth-lab/inlab/conformance.txt`
   (everything ✓: levels A–D and CORS). On Windows PowerShell, go through `cmd` so ✓ isn't garbled:
   `cmd /c "npm run conformance -- --level D > ..\oauth-lab\inlab\conformance.txt"`
3. **Prove the audience check by trying it:** set `app.google.client-id` to a wrong value,
   restart, sign in from the browser → you must get a 401. Put it back.
4. **Sign in for real** against your own backend (section 15) and save the screenshot as
   `inlab/signed-in.png`.
5. **Copy the backend files you changed** into `inlab/backend/` (just those files).
