#!/usr/bin/env node
// The conformance suite: does a running backend conform to openapi.yaml?
//
//   npm run conformance                                  http://localhost:8080, levels A–C, plus CORS
//   npm run conformance -- http://localhost:8090         another server
//   npm run conformance -- --level B                     levels A and B only (levels add up)
//   npm run conformance -- --level D                     everything, including Google sign-in
//
// It needs a running backend, and it changes data: it signs up a few accounts and creates
// (then deletes) a few courses, with unique names each run. Run it as often as you like.
import { createClient, runGroup, bold, dim, green, red } from "./lib.js";
import { createContext } from "./context.js";
import levelA from "./level-a.conf.js";
import levelB from "./level-b.conf.js";
import levelC from "./level-c.conf.js";
import levelD from "./level-d.conf.js";
import cors from "./cors.conf.js";

const LEVELS = [["A", levelA], ["B", levelB], ["C", levelC], ["D", levelD]];
const log = (line = "") => console.log(line);

function parseArgs(argv) {
  const opts = { base: "http://localhost:8080", level: "C" };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") opts.help = true;
    else if (arg === "--level" || arg === "-l") opts.level = String(argv[++i] ?? "").toUpperCase();
    else if (arg.startsWith("--level=")) opts.level = arg.slice(8).toUpperCase();
    else if (/^https?:\/\//.test(arg)) opts.base = arg.replace(/\/+$/, "");
    else opts.error = `Unknown argument: ${arg}`;
  }
  if (!["A", "B", "C", "D"].includes(opts.level)) opts.error = `--level must be A, B, C or D (got "${opts.level}")`;
  return opts;
}

const opts = parseArgs(process.argv.slice(2));
if (opts.help || opts.error) {
  if (opts.error) console.error(red(opts.error) + "\n");
  log("Usage: npm run conformance -- [base-url] [--level A|B|C|D]");
  log("  base-url   default http://localhost:8080");
  log("  --level    run levels up to and including this one (default C). CORS is always checked.");
  process.exit(opts.error ? 2 : 0);
}

const api = createClient(opts.base);
const ctx = createContext(api);
const upTo = LEVELS.findIndex(([key]) => key === opts.level);

log(bold("ESD course API — conformance suite"));
log(dim(`Target ${opts.base}   ·   levels A–${opts.level} + CORS   ·   run ${ctx.run}`));

// Fail fast, and clearly, if nothing is listening.
try {
  await fetch(`${opts.base}/api/courses`, { signal: AbortSignal.timeout(10000) });
} catch (error) {
  log("");
  log(red(`Can't reach ${opts.base} (${error.cause?.code || error.name}).`));
  log("Is your backend running, on that port? Start it, wait for \"Started …Application\", and try again.");
  process.exit(2);
}

const outcome = {}; // key → { passed, total }
for (const [key, register] of LEVELS.slice(0, upTo + 1)) {
  const results = await runGroup(register(ctx), log);
  outcome[key] = { passed: results.filter((r) => !r.failure).length, total: results.length };
}
const corsResults = await runGroup(cors(ctx), log);
outcome.CORS = { passed: corsResults.filter((r) => !r.failure).length, total: corsResults.length };

// ---- summary ---------------------------------------------------------------------
const passed = (key) => outcome[key] && outcome[key].passed === outcome[key].total;
const mark = (key) => {
  if (!outcome[key]) return dim("—");
  const failing = outcome[key].total - outcome[key].passed;
  return failing === 0 ? green("✓") : `${red("✗")} (${failing} failing)`;
};
log("");
log(bold("Summary"));
for (const key of [...LEVELS.map(([k]) => k), "CORS"]) {
  if (!outcome[key]) continue;
  const { passed: p, total } = outcome[key];
  log(`  ${(key === "CORS" ? "CORS   " : `Level ${key}`)}  ${p}/${total} passed`);
}
log("");
log(`${["A", "B", "C", "D"].map((k) => `Level ${k} ${mark(k)}`).join("  ")}  CORS ${mark("CORS")}`);

// A and B are milestones on the way to C. Nothing calls your own backend before React Lab 4,
// and CORS is added in that lab — so it's reported, but it isn't needed to be ready for it.
const core = ["A", "B", "C"];
if (core.every(passed)) {
  log(`Ready for React Lab 4 ${green("✓")}` + (passed("CORS") ? " — CORS too" : " — add CORS there"));
} else {
  const notRun = core.filter((k) => !outcome[k]);
  log(`Ready for React Lab 4: ${red("not yet")} — needs A, B and C (CORS is added in React Lab 4 itself)` +
    (notRun.length ? `. This run skipped ${notRun.join(" and ")}.` : ""));
}
if (!outcome.D) log(`OAuth lab: needs D ${dim("(built in that lab; check it with --level D)")}`);
else log(`OAuth lab: D ${mark("D")}`);

const allPassed = Object.keys(outcome).every(passed);
process.exit(allPassed ? 0 : 1);
