# ESD — The backend contract

In the Spring Boot labs you built a Course CRUD by hand and a JWT-protected slice with AI.
This folder turns that work into a backend the course's React app can rely on. The full
walkthrough is the doc: **https://esd-ta-sessions.vercel.app/api-contract.html** — read it
alongside this folder.

It's **your own code**: you grow **your** Spring Boot project, not a starter from us.
AI is allowed, the way Spring Boot Lab 2 allowed it: you restrict it and judge it, and you
own every line. The conformance suite is the judge.

## What's here

| Path | What it is |
| --- | --- |
| `openapi.yaml` | **The contract.** Every endpoint, request, response and error your backend must serve. Read-only. |
| `seed/seed.json` | The users, courses and enrollments your backend must start with. `seed/README.md` shows how to load it. |
| `conformance/` | The conformance suite: it calls a running backend and checks it against the contract. Don't edit it. |
| `mock/` | The mock API (the same one the React labs use). It passes everything — run it to see what "done" looks like. |

Node.js 20.19 or newer. Nothing to `npm install`.

## Run it

```bash
cd esd-labs/api-contract

npm run mock                 # terminal 1: the mock API on http://localhost:8080
npm run conformance          # terminal 2: everything green. Now stop the mock (Ctrl+C)…

# …start YOUR backend on port 8080, and:
npm run conformance                          # levels A–C, plus CORS
npm run conformance -- --level A             # just level A (levels add up: B runs A and B)
npm run conformance -- --level D             # everything, including Google sign-in
npm run conformance -- http://localhost:9090 # a backend on another port
```

It needs a running backend, and it changes data: it signs up a few accounts and creates
(then deletes) a few courses, with new names every run. Run it as often as you like.

## The levels

The levels build on each other. They're milestones on the way to one goal: nothing in
the React labs calls your own backend until **React Lab 4**, the integration lab, and
that lab grades **A, B and C** (plus CORS) as its own part.

| Level | Checks |
| --- | --- |
| **A** Catalogue | `GET /api/courses` (sorting, filters), `GET /api/courses/{id}`, the seed, the `ApiError` shape |
| **B** Accounts | signup, login, `GET /api/users/me`, logout, the 401 rules |
| **C** Enrollments and admin | enroll, drop, my enrollments, ADMIN course writes, every 409 rule — **aim to have A + B + C green before React Lab 4 — it's graded there as its own part** |
| **D** Google | `POST /api/auth/google`, as far as it can be checked without a real Google sign-in — built in the OAuth lab |

**CORS** is checked on its own line, not inside a level. You add it in React Lab 4, the
first time a browser calls your backend; until then, expect those checks to fail.

Start now, and work A → B → C alongside the React labs. They never wait for your
backend: they use the mock until React Lab 4.

## What "ready" means

The suite ends with a summary like:

```
Level A ✓  Level B ✓  Level C ✗ (3 failing)  Level D —  CORS ✗ (8 failing)
Ready for React Lab 4: not yet — needs A, B and C (CORS is added in React Lab 4 itself)
OAuth lab: needs D (built in that lab; check it with --level D)
```

Every failed check prints the request, what the contract expected, what your backend
sent, and often a hint. Fix the first failure in the lowest level first: later ones often
follow from it. When A, B and C are all ✓ the summary says **Ready for React Lab 4 ✓ — add
CORS there**. React Lab 4 tells you what to submit.

## A second opinion: Schemathesis (optional)

The conformance suite checks the **rules the contract states in words**: the 409 messages,
the credit limit, logout revocation, the seed, auth before body, CORS. No tool can infer
those from a schema.

[Schemathesis](https://schemathesis.readthedocs.io/) does the opposite: it reads
`openapi.yaml`, generates hundreds of requests (including odd ones), and checks every
response against the **declared shapes and status codes**. It is good at finding 500s on
input you never thought of. Both green means your backend is ready.

```bash
pip install schemathesis      # Python 3.9+; or: pipx install schemathesis.  Check: st --version
```

Run it **after** the conformance suite, against a database you can throw away (restart
H2, or reset MySQL): it logs in as the admin, so it creates, changes and **deletes**
courses, seeded ones included.

```bash
# macOS / Linux
st run openapi.yaml --url http://localhost:8080 --checks all \
  --exclude-checks ensure_resource_availability \
  -H "Authorization: Bearer $(npm run -s token)" \
  --exclude-path /api/auth/logout --generation-codec ascii

# Windows (PowerShell)
$t = npm run -s token
st run openapi.yaml --url http://localhost:8080 --checks all --exclude-checks ensure_resource_availability -H "Authorization: Bearer $t" --exclude-path /api/auth/logout --generation-codec ascii
```

Why those options: `npm run -s token` logs in as `admin@esd.local` and prints the token.
`/api/auth/logout` is left out so the token isn't revoked mid-run. `--generation-codec
ascii` avoids characters like emoji, which Spring's `@Size` counts as two. And
`ensure_resource_availability` is left out because deleting a course deletes its
enrollments (the contract says so), which that check would wrongly report as "created
resource not found".

Each finding comes with a `curl` command that reproduces it. The mock passes cleanly.

## Rules

- **Don't edit** `openapi.yaml`, `seed/`, `conformance/` or `mock/`. If you think the
  contract is wrong, ask a TA.
- The suite talks to your backend over HTTP only. It doesn't care how you built it — only
  what it answers.
