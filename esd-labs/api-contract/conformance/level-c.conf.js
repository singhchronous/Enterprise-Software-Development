// Level C — enrollments and admin: ADMIN course writes, enroll, drop, list mine, every
// 409 rule and the order they're checked in. The suite creates its own courses (and
// deletes them at the end), so it never uses up seats in the seeded courses.
import { createGroup, expectStatus, expectJson, expectShape, expectApiError, expectEmptyBody, expectSortedByCode, ok, show, time, COURSE, ENROLLMENT, MISSING_ID } from "./lib.js";
import { FULL_CODES } from "./context.js";

export default function levelC(ctx) {
  const t = createGroup("C", "Enrollments and admin");
  const { api } = ctx;
  const AUTH_REQUIRED = "Authentication required";
  const DENIED = "Access denied";
  const ALREADY = "Already enrolled in this course";
  const FULL = "Course is full";
  const CREDITS = "Credit limit of 24 exceeded";

  const taken = new Set();
  const created = new Map(); // id → the CourseRequest body it currently has
  const courses = {}; // name → Course (as created)
  const enrollments = []; // { id, user } — every 201 from POST /api/enrollments, dropped at the end if still there
  const admin = () => ctx.seeded("admin@esd.local");
  const student = () => ctx.seeded("student@esd.local");
  const riya = () => ctx.seeded("riya@esd.local");
  const userA = () => ctx.fresh("a");
  const userB = () => ctx.fresh("b");
  const need = (name, from) => ok(courses[name], `the test course "${name}" from ${from} (it failed, so this check can't run)`);

  const body = (overrides = {}) => ({
    code: ctx.newCode(taken),
    title: `Conformance ${ctx.run}`,
    description: "Created by the conformance suite; deleted when it finishes.",
    department: "Conformance Testing",
    credits: 6,
    capacity: 5,
    ...overrides,
  });

  // POST /api/courses as admin; remembers the course for later checks and for cleanup.
  async function create(name, overrides = {}) {
    const sent = body(overrides);
    const res = await api.post("/api/courses", { user: await admin(), body: sent });
    if (res.status === 201 && res.json?.id) created.set(res.json.id, sent);
    expectStatus(res, 201);
    expectJson(res);
    if (name) courses[name] = res.json;
    return { res, sent };
  }

  async function enroll(user, courseId) {
    const res = await api.post("/api/enrollments", { user, body: { courseId } });
    if (res.status === 201 && res.json?.id) enrollments.push({ id: res.json.id, user });
    return res;
  }

  async function mine(user) {
    const res = await api.get("/api/users/me/enrollments", { user });
    expectStatus(res, 200);
    expectJson(res);
    ok(Array.isArray(res.json), "a JSON array of enrollments", res);
    return res;
  }
  const courseIdsOf = (res) => res.json.map((e) => e.course?.id);

  // ---- auth and roles ----------------------------------------------------------

  t.check("C01", "POST /api/courses without a token → 401, even with a bad body (auth before body)", async () => {
    expectApiError(await api.post("/api/courses", { body: {} }), 401, { message: AUTH_REQUIRED });
  });

  t.check("C02", "POST /api/enrollments without a token and with malformed JSON → 401, not 400", async () => {
    expectApiError(await api.post("/api/enrollments", { raw: '{"courseId": ' }), 401, { message: AUTH_REQUIRED });
  });

  t.check("C03", "POST /api/courses as a STUDENT → 403 \"Access denied\"", async () => {
    expectApiError(await api.post("/api/courses", { user: await student(), body: body() }), 403, { message: DENIED });
  });

  t.check("C04", "POST /api/courses as the account that asked for ADMIN at signup → 403", async () => {
    const user = ctx.users["wants-admin"] ?? (await ctx.fresh("wants-admin", { role: "ADMIN" }));
    expectApiError(await api.post("/api/courses", { user, body: body() }), 403, { message: DENIED });
  });

  // ---- ADMIN course writes --------------------------------------------------------

  t.check("C05", "POST /api/courses as ADMIN → 201, the new Course (seatsLeft = capacity)", async () => {
    const { res, sent } = await create("K1");
    expectShape(res.json, COURSE, "the created course", res);
    for (const key of ["code", "title", "description", "department", "credits", "capacity"]) {
      ok(res.json[key] === sent[key], `${key} = ${show(sent[key])} (as sent), not ${show(res.json[key])}`, res);
    }
    ok(res.json.seatsLeft === sent.capacity, `seatsLeft = ${sent.capacity} (no enrollments yet)`, res);
  });

  t.check("C06", "POST /api/courses without a description → 201, description null", async () => {
    const { res } = await create("KX", { description: undefined, credits: 1 });
    ok(res.json.description === null, `"description": null (present, and null), not ${show(res.json.description)}`, res);
    // The rest of the courses the checks below use.
    await create("K2");
    await create("K3");
    await create("K4");
    await create("KF", { credits: 1, capacity: 1 });
    await create("KD", { credits: 2 });
  });

  t.check("C07", "the new course is served by GET /api/courses/{id} and listed, still sorted by code", async () => {
    need("K1", "C05");
    const one = await api.get(`/api/courses/${courses.K1.id}`);
    expectStatus(one, 200);
    for (const key of Object.keys(COURSE)) ok(one.json?.[key] === courses.K1[key], `${key} = ${show(courses.K1[key])}`, one);
    const list = await api.get("/api/courses");
    expectStatus(list, 200);
    ok(list.json.some((c) => c.id === courses.K1.id), `the list to include ${courses.K1.code}`, list);
    expectSortedByCode(list.json, "courses", list);
  });

  t.check("C08", "POST /api/courses with a code that exists → 409", async () => {
    need("K1", "C05");
    const res = await api.post("/api/courses", { user: await admin(), body: body({ code: courses.K1.code }) });
    if (res.status === 201 && res.json?.id) created.set(res.json.id, null);
    expectApiError(res, 409);
  });

  t.check("C09", "POST /api/courses with {} → 400, fieldErrors for code, title, department, credits, capacity", async () => {
    const res = await api.post("/api/courses", { user: await admin(), body: {} });
    expectApiError(res, 400, { fields: ["code", "title", "department", "credits", "capacity"] });
  });

  t.check("C10", "POST /api/courses with bad values → 400, one fieldErrors entry per bad field", async () => {
    const bad = { code: "cs101", title: " ", description: "x".repeat(1001), department: "", credits: 7, capacity: 0 };
    expectApiError(await api.post("/api/courses", { user: await admin(), body: bad }), 400,
      { fields: ["code", "title", "description", "department", "credits", "capacity"] });
    const bounds = body({ credits: 0, capacity: 501 });
    expectApiError(await api.post("/api/courses", { user: await admin(), body: bounds }), 400, { fields: ["credits", "capacity"] });
  });

  t.check("C11", "POST /api/courses with malformed JSON (as ADMIN) → 400, fieldErrors null", async () => {
    expectApiError(await api.post("/api/courses", { user: await admin(), raw: '{"code": "CS999", ' }), 400);
  });

  t.check("C12", "PUT /api/courses/{id} → 200, a full replacement (omitted description → null; keeping its own code is fine)", async () => {
    need("K1", "C05");
    const sent = { ...created.get(courses.K1.id), title: `Renamed ${ctx.run}`, department: "Conformance Renamed" };
    delete sent.description;
    const res = await api.put(`/api/courses/${courses.K1.id}`, { user: await admin(), body: sent });
    expectStatus(res, 200);
    expectShape(res.json, COURSE, "the updated course", res);
    ok(res.json.title === sent.title && res.json.department === sent.department, `title and department updated`, res);
    ok(res.json.description === null, `"description": null (it was omitted, and PUT replaces everything)`, res);
    ok(res.json.code === sent.code, `the same code ${sent.code}`, res);
    created.set(courses.K1.id, sent);
    courses.K1 = res.json;
  });

  t.check("C13", "PUT with another course's code → 409", async () => {
    need("K1", "C05"); need("K2", "C06");
    const sent = { ...created.get(courses.K1.id), code: courses.K2.code };
    expectApiError(await api.put(`/api/courses/${courses.K1.id}`, { user: await admin(), body: sent }), 409);
  });

  t.check("C14", "PUT: unknown id → 404, id \"abc\" → 400, bad body → 400 \"Validation failed\"", async () => {
    need("K1", "C05");
    const user = await admin();
    expectApiError(await api.put(`/api/courses/${MISSING_ID}`, { user, body: body() }), 404);
    expectApiError(await api.put("/api/courses/abc", { user, body: body() }), 400);
    expectApiError(await api.put(`/api/courses/${courses.K1.id}`, { user, body: { title: "Only a title" } }), 400,
      { fields: ["code", "department", "credits", "capacity"] });
  });

  t.check("C15", "PUT and DELETE as a STUDENT → 403; without a token → 401", async () => {
    need("KD", "C06");
    const path = `/api/courses/${courses.KD.id}`;
    const same = created.get(courses.KD.id);
    const user = await student();
    expectApiError(await api.put(path, { user, body: same }), 403, { message: DENIED });
    expectApiError(await api.del(path, { user }), 403, { message: DENIED });
    expectApiError(await api.put(path, { body: same }), 401, { message: AUTH_REQUIRED });
    expectApiError(await api.del(path), 401, { message: AUTH_REQUIRED });
  });

  // ---- enroll ----------------------------------------------------------------------

  t.check("C16", "POST /api/enrollments → 201 { id, course, enrolledAt }; seatsLeft goes down by one", async () => {
    need("K1", "C05");
    const res = await enroll(await userA(), courses.K1.id);
    expectStatus(res, 201);
    expectJson(res);
    expectShape(res.json, ENROLLMENT, "the enrollment", res);
    ok(res.json.course.id === courses.K1.id, `course.id = ${courses.K1.id}`, res);
    ok(res.json.course.seatsLeft === courses.K1.capacity - 1, `course.seatsLeft = ${courses.K1.capacity - 1} (capacity − enrollments, counting this one)`, res);
    const after = await api.get(`/api/courses/${courses.K1.id}`);
    ok(after.json?.seatsLeft === courses.K1.capacity - 1, `GET the course: seatsLeft = ${courses.K1.capacity - 1}`, after);
  });

  t.check("C17", "POST /api/enrollments with {} → 400 (fieldErrors.courseId); malformed JSON → 400, fieldErrors null", async () => {
    const user = await userA();
    expectApiError(await api.post("/api/enrollments", { user, body: {} }), 400, { fields: ["courseId"] });
    expectApiError(await api.post("/api/enrollments", { user, raw: '{"courseId": ' }), 400);
  });

  t.check("C18", "enrolling in a course that doesn't exist → 404", async () => {
    const res = await enroll(await userA(), Number(MISSING_ID));
    expectApiError(res, 404);
  });

  t.check("C19", "enrolling twice in the same course → 409 \"Already enrolled in this course\"", async () => {
    need("K1", "C05");
    expectApiError(await enroll(await userA(), courses.K1.id), 409, { message: ALREADY });
  });

  t.check("C20", "enrolling up to exactly 24 credits is allowed", async () => {
    for (const name of ["K2", "K3", "K4"]) {
      need(name, "C06");
      const res = await enroll(await userA(), courses[name].id);
      expectStatus(res, 201);
    }
  });

  t.check("C21", "one course more than 24 credits → 409 \"Credit limit of 24 exceeded\"", async () => {
    need("KX", "C06");
    expectApiError(await enroll(await userA(), courses.KX.id), 409, { message: CREDITS });
  });

  t.check("C22", "a full course → 409 \"Course is full\" (the five seeded full courses, and one we fill)", async () => {
    need("KF", "C06");
    const list = await api.get("/api/courses");
    for (const code of FULL_CODES) {
      const course = list.json?.find?.((c) => c.code === code);
      ok(course, `seeded course ${code} in GET /api/courses`, list);
      expectApiError(await enroll(await student(), course.id), 409, { message: FULL });
    }
    expectStatus(await enroll(await userB(), courses.KF.id), 201);
    expectApiError(await enroll(await ctx.fresh("c"), courses.KF.id), 409, { message: FULL });
  });

  t.check("C23", "rule order: 404 before everything — an unknown course at the credit limit is 404", async () => {
    expectApiError(await enroll(await userA(), Number(MISSING_ID)), 404);
  });

  t.check("C24", "rule order: already enrolled before full — riya again in CS201 (full) → \"Already enrolled…\"", async () => {
    const list = await api.get("/api/courses?q=CS201");
    const cs201 = list.json?.find?.((c) => c.code === "CS201");
    ok(cs201, "CS201 in the catalogue", list);
    expectApiError(await enroll(await riya(), cs201.id), 409, { message: ALREADY });
  });

  t.check("C25", "rule order: full before the credit limit — at 24 credits, a full course → \"Course is full\"", async () => {
    need("KF", "C06");
    expectApiError(await enroll(await userA(), courses.KF.id), 409, { message: FULL });
  });

  t.check("C26", "rule order: already enrolled before the credit limit — at 24 credits, a course you're in → \"Already enrolled…\"", async () => {
    need("K1", "C05");
    expectApiError(await enroll(await userA(), courses.K1.id), 409, { message: ALREADY });
  });

  // ---- list mine ---------------------------------------------------------------------

  t.check("C27", "GET /api/users/me/enrollments → your enrollments, oldest first, each with its Course", async () => {
    const res = await mine(await userA());
    for (const e of res.json) expectShape(e, ENROLLMENT, "an enrollment", res);
    const expected = ["K1", "K2", "K3", "K4"].map((n) => courses[n]?.id);
    ok(courseIdsOf(res).join(",") === expected.join(","), `the courses in enrollment order: ${expected.join(", ")} (got ${courseIdsOf(res).join(", ")})`, res);
    for (let i = 1; i < res.json.length; i++) {
      const a = res.json[i - 1], b = res.json[i];
      ok(time(a.enrolledAt) < time(b.enrolledAt) || (time(a.enrolledAt) === time(b.enrolledAt) && a.id < b.id), "sorted by enrolledAt, then id", res);
    }
  });

  t.check("C28", "riya's seeded enrollments are the five full courses", async () => {
    const res = await mine(await riya());
    const codes = res.json.map((e) => e.course?.code);
    for (const code of FULL_CODES) ok(codes.includes(code), `riya@esd.local enrolled in ${code}`, res);
  });

  t.check("C29", "GET /api/users/me/enrollments without a token → 401", async () => {
    expectApiError(await api.get("/api/users/me/enrollments"), 401, { message: AUTH_REQUIRED });
  });

  // ---- drop -----------------------------------------------------------------------------

  t.check("C30", "dropping someone else's enrollment → 403 \"Access denied\"", async () => {
    const theirs = (await mine(await userA())).json[0];
    ok(theirs, "user A to have an enrollment (C16)");
    expectApiError(await api.del(`/api/enrollments/${theirs.id}`, { user: await userB() }), 403, { message: DENIED });
  });

  t.check("C31", "DELETE /api/enrollments: unknown id → 404, \"abc\" → 400, no token → 401", async () => {
    const user = await userA();
    expectApiError(await api.del(`/api/enrollments/${MISSING_ID}`, { user }), 404);
    expectApiError(await api.del("/api/enrollments/abc", { user }), 400);
    expectApiError(await api.del(`/api/enrollments/${MISSING_ID}`), 401, { message: AUTH_REQUIRED });
  });

  t.check("C32", "dropping your own → 204, empty body; the seat and the credits come back", async () => {
    need("K4", "C06"); need("KX", "C06");
    const user = await userA();
    const target = (await mine(user)).json.find((e) => e.course?.id === courses.K4.id);
    ok(target, `user A enrolled in ${courses.K4.code} (C20)`);
    const res = await api.del(`/api/enrollments/${target.id}`, { user });
    expectStatus(res, 204);
    expectEmptyBody(res);
    const after = await mine(user);
    ok(!courseIdsOf(after).includes(courses.K4.id), `${courses.K4.code} gone from your enrollments`, after);
    const course = await api.get(`/api/courses/${courses.K4.id}`);
    ok(course.json?.seatsLeft === courses.K4.capacity, `${courses.K4.code}.seatsLeft back to ${courses.K4.capacity}`, course);
    expectStatus(await enroll(user, courses.KX.id), 201); // 18 + 1 credits now fits
  });

  // ---- capacity and delete -----------------------------------------------------------

  t.check("C33", "capacity can't go below current enrollments → 409; equal is fine (seatsLeft 0, then \"Course is full\")", async () => {
    need("K1", "C05");
    expectStatus(await enroll(await userB(), courses.K1.id), 201); // K1 now has users A and B
    const user = await admin();
    const sent = created.get(courses.K1.id);
    expectApiError(await api.put(`/api/courses/${courses.K1.id}`, { user, body: { ...sent, capacity: 1 } }), 409);
    const res = await api.put(`/api/courses/${courses.K1.id}`, { user, body: { ...sent, capacity: 2 } });
    expectStatus(res, 200);
    ok(res.json?.seatsLeft === 0, "seatsLeft 0 (capacity 2, two enrollments)", res);
    created.set(courses.K1.id, { ...sent, capacity: 2 });
    expectApiError(await enroll(await student(), courses.K1.id), 409, { message: FULL });
  });

  t.check("C34", "DELETE /api/courses/{id} → 204; the course is gone, and so are its enrollments", async () => {
    need("K1", "C05");
    const res = await api.del(`/api/courses/${courses.K1.id}`, { user: await admin() });
    expectStatus(res, 204);
    expectEmptyBody(res);
    created.delete(courses.K1.id);
    expectApiError(await api.get(`/api/courses/${courses.K1.id}`), 404);
    for (const user of [await userA(), await userB()]) {
      const list = await mine(user);
      ok(!courseIdsOf(list).includes(courses.K1.id), `${user.email}'s enrollments no longer include the deleted course`, list);
    }
  });

  t.check("C35", "DELETE /api/courses: an unused course → 204; unknown id → 404; \"abc\" → 400", async () => {
    need("KD", "C06");
    const user = await admin();
    expectStatus(await api.del(`/api/courses/${courses.KD.id}`, { user }), 204);
    created.delete(courses.KD.id);
    expectApiError(await api.del(`/api/courses/${MISSING_ID}`, { user }), 404);
    expectApiError(await api.del("/api/courses/abc", { user }), 400);
  });

  // ---- clean up: delete every course this run created (their enrollments go with them),
  // and drop anything a broken backend let us enroll in elsewhere. --------------------------
  t.cleanup(async () => {
    const ours = new Set(created.keys());
    for (const { id, user } of enrollments) {
      const res = await api.get("/api/users/me/enrollments", { user });
      const e = Array.isArray(res.json) ? res.json.find((x) => x.id === id) : null;
      if (e && !ours.has(e.course?.id)) await api.del(`/api/enrollments/${id}`, { user });
    }
    const leftovers = [];
    for (const id of created.keys()) {
      const res = await api.del(`/api/courses/${id}`, { user: await admin() });
      if (res.status !== 204 && res.status !== 404) leftovers.push(id);
    }
    if (leftovers.length) throw new Error(`could not delete test course(s) with id ${leftovers.join(", ")} — delete them as admin`);
  });

  return t;
}
