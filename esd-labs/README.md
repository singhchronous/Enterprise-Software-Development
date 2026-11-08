# ESD 2026 — Labs

Starter code for the ESD frontend labs. **One folder per lab.** The lab docs
live on the course site: **https://esd-ta-sessions.vercel.app/**

| Folder | Lab | Doc |
| --- | --- | --- |
| [`js-lab1/`](js-lab1/) | JS Lab 1 — JavaScript for React | [js-react.html](https://esd-ta-sessions.vercel.app/js-react.html) |
| [`js-lab2/`](js-lab2/) | JS Lab 2 — A JavaScript app, without React | [js-app.html](https://esd-ta-sessions.vercel.app/js-app.html) |
| [`api-contract/`](api-contract/) | The backend contract (runs alongside the React labs) | [api-contract.html](https://esd-ta-sessions.vercel.app/api-contract.html) |
| [`react-lab1/`](react-lab1/) | React Lab 1 — Your first React app, by hand | [react-lab1.html](https://esd-ta-sessions.vercel.app/react-lab1.html) |
| [`react-lab2/`](react-lab2/) | React Lab 2 — AI-assisted: restrict, then judge | [react-lab2.html](https://esd-ta-sessions.vercel.app/react-lab2.html) |
| [`react-lab3/`](react-lab3/) | React Lab 3 — Screens, routes and logging in | [react-lab3.html](https://esd-ta-sessions.vercel.app/react-lab3.html) |
| [`react-bug-lab/`](react-bug-lab/) | React Bug Lab — predict, trigger, fix (your app comes as a zip on the day) | [react-bug-lab.html](https://esd-ta-sessions.vercel.app/react-bug-lab.html) |
| [`react-lab4/`](react-lab4/) | React Lab 4 — Your own backend, end to end | [react-lab4.html](https://esd-ta-sessions.vercel.app/react-lab4.html) |
| [`oauth-lab/`](oauth-lab/) | OAuth2 Lab — Sign in with Google | [oauth-lab.html](https://esd-ta-sessions.vercel.app/oauth-lab.html) |

More folders appear here as each lab is released.

## Getting started (once)

```bash
git clone https://github.com/shreyasg-git/esd-labs.git
cd esd-labs/js-lab1
npm test
```

You need **Node.js 20 or newer** (`node -v`). There is nothing to `npm install`
for the JS labs.

## Before each new lab

Commit your own work, then pull:

```bash
cd esd-labs
git add -A
git commit -m "my work on js-lab1"
git pull
```

The new lab's folder appears next to the ones you have.

## How the folders work

- **Each folder stands alone.** It has its own `package.json` and its own
  tests. Run everything from *inside* the lab's folder. A half-finished lab
  never breaks the next one.
- **Each lab builds on the last.** Each new lab folder already contains a
  finished version of what it builds on, so you're never blocked by an exercise
  you didn't finish, and you never copy files between labs.
- **Released folders don't change**, except for an announced bug fix. New labs
  only *add* folders, so `git pull` doesn't fight with your work.
- **Don't edit the tests.** They are the specification. Fix your code until they pass.

## If `git pull` complains

`Your local changes would be overwritten` means you have uncommitted work.
Commit it (above) and pull again. If a pull ever stops with a merge conflict,
ask a TA rather than deleting anything.
