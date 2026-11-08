// Level A — the catalogue: GET /api/courses (with filters), GET /api/courses/{id},
// the seed courses, and the ApiError shape. No login needed.
import { createGroup, expectStatus, expectJson, expectShape, expectApiError, expectSortedByCode, ok, show, COURSE, MISSING_ID } from "./lib.js";
import { SEED, FULL_CODES } from "./context.js";

export default function levelA(ctx) {
  const t = createGroup("A", "Catalogue");
  const { api } = ctx;
  let all = null; // the full list, from A01
  const need = () => ok(all !== null, "the course list from A01 (A01 failed, so this check can't run)");
  const codesOf = (list) => list.map((c) => c.code);
  const byCode = (code) => all.find((c) => c.code === code);

  // Every course in `res` matches `test`, the list is sorted, and it includes `mustInclude`.
  function expectFiltered(res, test, what, mustInclude = [], mustExclude = []) {
    expectStatus(res, 200);
    expectJson(res);
    ok(Array.isArray(res.json), "a JSON array", res);
    for (const c of res.json) ok(test(c), `only ${what} — but got ${c.code} (${show(c.department)}, ${show(c.title)})`, res);
    expectSortedByCode(res.json, "the filtered list", res);
    const codes = codesOf(res.json);
    const missing = mustInclude.filter((code) => !codes.includes(code));
    ok(missing.length === 0, `the list to include ${mustInclude.join(", ")} (missing: ${missing.join(", ")})`, res);
    const extra = mustExclude.filter((code) => codes.includes(code));
    ok(extra.length === 0, `the list not to include ${extra.join(", ")}`, res);
  }
  const dsCodes = SEED.courses.filter((c) => c.department === "Data Science & AI").map((c) => c.code);
  const isDs = (c) => c.department.toLowerCase() === "data science & ai";
  const hasData = (c) => c.code.toLowerCase().includes("data") || c.title.toLowerCase().includes("data");
  const dataCodes = SEED.courses.filter(hasData).map((c) => c.code);

  t.check("A01", "GET /api/courses → 200 and a JSON array", async () => {
    const res = await api.get("/api/courses");
    expectStatus(res, 200);
    expectJson(res);
    ok(Array.isArray(res.json), "a JSON array of courses (not wrapped in an object, no paging)", res);
    all = res.json;
    all.res = res;
  });

  t.check("A02", "every course has the Course shape (8 fields, right types)", async () => {
    need();
    for (const course of all) expectShape(course, COURSE, `course ${course?.code ?? "?"}`, all.res);
  });

  t.check("A03", "courses are sorted by code, ascending", async () => {
    need();
    expectSortedByCode(all, "courses", all.res);
  });

  t.check("A04", "the 20 seeded courses are there, exactly as in seed.json", async () => {
    need();
    for (const seed of SEED.courses) {
      const course = byCode(seed.code);
      ok(course, `course ${seed.code} from seed.json`, all.res, "Load seed/seed.json when the backend starts (see seed/README.md).");
      for (const field of ["title", "description", "department", "credits", "capacity"]) {
        ok(course[field] === seed[field], `${seed.code} ${field} = ${show(seed[field])}, not ${show(course[field])}`, all.res,
          "If you changed it while testing, reset your database so the seed loads again.");
      }
    }
  });

  t.check("A05", "the five full courses have seatsLeft 0; every seatsLeft is between 0 and capacity", async () => {
    need();
    for (const code of FULL_CODES) {
      const course = byCode(code);
      ok(course, `course ${code}`, all.res);
      ok(course.seatsLeft === 0, `${code}.seatsLeft = 0 (riya@esd.local fills it in the seed), not ${show(course.seatsLeft)}`, all.res,
        "seatsLeft is capacity minus the course's enrollments. Did the seed enrollments load?");
    }
    for (const c of all) ok(c.seatsLeft >= 0 && c.seatsLeft <= c.capacity, `${c.code}: 0 ≤ seatsLeft ≤ capacity`, all.res);
  });

  t.check("A06", "GET /api/courses/{id} → 200, the same course as in the list", async () => {
    need();
    const cs101 = byCode("CS101");
    ok(cs101, "CS101 in the list");
    const res = await api.get(`/api/courses/${cs101.id}`);
    expectStatus(res, 200);
    expectJson(res);
    expectShape(res.json, COURSE, "the course", res);
    for (const key of Object.keys(COURSE)) ok(res.json[key] === cs101[key], `${key} = ${show(cs101[key])} (as in the list)`, res);
  });

  t.check("A07", "GET /api/courses/999999999 → 404 with the ApiError shape", async () => {
    expectApiError(await api.get(`/api/courses/${MISSING_ID}`), 404);
  });

  t.check("A08", "a path id that isn't a positive integer → 400 (abc, 0, -1, 2^63)", async () => {
    for (const bad of ["abc", "0", "-1", "9223372036854775808"]) expectApiError(await api.get(`/api/courses/${bad}`), 400);
  });

  t.check("A09", "the largest 64-bit id is a valid id → 404 when absent, not 400", async () => {
    expectApiError(await api.get("/api/courses/9223372036854775807"), 404);
  });

  t.check("A10", "?department=Data%20Science%20%26%20AI → the four DS courses (the & is URL-encoded)", async () => {
    const res = await api.get(`/api/courses?department=${encodeURIComponent("Data Science & AI")}`);
    expectFiltered(res, isDs, `courses in "Data Science & AI"`, dsCodes);
  });

  t.check("A11", "the department filter ignores case", async () => {
    const res = await api.get(`/api/courses?department=${encodeURIComponent("data science & ai")}`);
    expectFiltered(res, isDs, `courses in "Data Science & AI"`, dsCodes);
    const shouty = await api.get("/api/courses?department=COMPUTER%20SCIENCE");
    expectFiltered(shouty, (c) => c.department.toLowerCase() === "computer science", "Computer Science courses", ["CS101", "CS201", "CS305", "CS402", "CS501"]);
  });

  t.check("A12", "an unknown department → 200 and []", async () => {
    const res = await api.get("/api/courses?department=Astrology");
    expectStatus(res, 200);
    ok(Array.isArray(res.json) && res.json.length === 0, "an empty array", res);
  });

  t.check("A13", "?q=data → courses with 'data' in the code or title", async () => {
    expectFiltered(await api.get("/api/courses?q=data"), hasData, `courses matching "data"`, dataCodes);
  });

  t.check("A14", "q ignores case (DATA) and matches codes too (cs10 → CS101)", async () => {
    expectFiltered(await api.get("/api/courses?q=DATA"), hasData, `courses matching "data"`, dataCodes);
    const byCodeRes = await api.get("/api/courses?q=cs10");
    expectFiltered(byCodeRes, (c) => c.code.toLowerCase().includes("cs10") || c.title.toLowerCase().includes("cs10"), `courses matching "cs10"`, ["CS101"]);
  });

  t.check("A15", "department and q together: both must match", async () => {
    const res = await api.get("/api/courses?department=Computer%20Science&q=data");
    expectFiltered(res, (c) => c.department.toLowerCase() === "computer science" && hasData(c), `Computer Science courses matching "data"`, ["CS201", "CS305"], ["DS101"]);
  });

  t.check("A16", "a q that matches nothing → 200 and []", async () => {
    const res = await api.get("/api/courses?q=zzzz-no-such-course");
    expectStatus(res, 200);
    ok(Array.isArray(res.json) && res.json.length === 0, "an empty array", res);
  });

  t.check("A17", "blank parameters are ignored (?q=, ?q=%20, ?department=)", async () => {
    need();
    const expected = codesOf(all).join(",");
    for (const query of ["?q=", "?q=%20", "?department=", "?department=%20&q="]) {
      const res = await api.get(`/api/courses${query}`);
      expectStatus(res, 200);
      ok(Array.isArray(res.json) && codesOf(res.json).join(",") === expected, `the full list, as with no parameters (${query} is blank)`, res);
    }
  });

  return t;
}
