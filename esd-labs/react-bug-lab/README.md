# ESD — React Bug Lab: predict, trigger, fix

One small React app, one planted bug, and a bug report from a user. Your job is to
**predict** what's wrong and where, **trigger** the failure and see it, **fix** it, and
**trigger it again** to show it's gone — and then explain why. The full walkthrough is the
lab doc: **https://esd-ta-sessions.vercel.app/react-bug-lab.html** — read it before the lab.

**AI only after your prediction.** Parts 1–4 of `PREDICTION.md` are written by you, from
the bug report and the code, and handed in before you start the app or open any AI tool.

## Your app arrives on the day

This folder holds only this README and a blank `PREDICTION.md` (so you can see the form).
Your app — one of 32 — is handed out as a zip when the lab starts. Find your row in the
assignment sheet your TA shares, download that one zip, and unzip it anywhere:

```
react-bug-<variant>/
  README.md        how to run it
  TRIGGER.md       the bug report: what a user saw, the steps, what should happen
  PREDICTION.md    your prediction (parts 1–4 first), then what happened (parts 5–9)
  src/             the app — the bug is in here, somewhere
  mock/            the course API, served at /api by npm run dev — don't edit it
```

```bash
cd react-bug-<variant>
npm install        # while it runs: read TRIGGER.md and src/, write PREDICTION.md parts 1–4
                   # hand parts 1–4 in, THEN:
npm run dev        # http://localhost:5173 — the app and the mock course API
```

Node.js 20.19 or newer. Each app has a **Network** menu in its header (Normal, Slow,
Random, Failing) that makes the local API slow, shuffled or failing on purpose — some
bug reports need it.

## The method

1. **Predict** (no app, no AI): what's wrong, where, what you'll see when you trigger it,
   and what your fix will be. Hand it in.
2. **Trigger**: `npm run dev`, follow `TRIGGER.md`, with DevTools open. Did you see what
   you predicted?
3. **Fix**: the smallest change that stops it. AI is allowed now — to check your
   understanding, not to replace it.
4. **Re-trigger**: the same steps. Then finish `PREDICTION.md`.

The lab is **ungraded**. What you hand in is `PREDICTION.md`: parts 1–4 before AI, the
rest by the end of the lab.
