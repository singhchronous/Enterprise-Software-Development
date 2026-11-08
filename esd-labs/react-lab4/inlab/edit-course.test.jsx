// IN-LAB TASK (section 15) — run with:  npm run inlab
// The spec is inlab/CONTRACT.md. Don't edit this file.
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { screen } from "@testing-library/react";
import { stubFetch } from "../test/support/fetch.js";
import { header, logInFromHeader, renderApp, submitLogin } from "../test/support/app.jsx";

let server;
beforeEach(() => {
  server = stubFetch();
});
afterEach(() => {
  vi.restoreAllMocks(); // window.confirm
});

const CS402 = "CS402 · Enterprise Software Development";

// Open the edit page for CS402 as the admin (logging in on the way).
async function editAsAdmin() {
  const view = renderApp("/admin/courses/4/edit");
  await submitLogin(view.user, "admin");
  await screen.findByRole("heading", { name: "Edit CS402" });
  return view;
}
async function setField(user, label, value) {
  await user.clear(screen.getByLabelText(label));
  if (value !== "") await user.type(screen.getByLabelText(label), value);
}

describe("in-lab · edit and delete a course, for ADMINs only", () => {
  test("a STUDENT sees no Edit course link on a course page", async () => {
    const { user } = renderApp("/courses/4");
    await screen.findByRole("heading", { name: CS402 });
    await logInFromHeader(user, "student");
    await screen.findByRole("heading", { name: CS402 });
    expect(screen.queryByRole("link", { name: "Edit course" })).not.toBeInTheDocument();
  });

  test("a STUDENT who types the edit URL gets \"You don't have access\"", async () => {
    const { user } = renderApp("/admin/courses/4/edit");
    await submitLogin(user, "student");
    expect(await screen.findByRole("heading", { name: "You don't have access" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Code")).not.toBeInTheDocument();
  });

  test("an ADMIN: Edit course opens the form, filled in with the course", async () => {
    const { user } = renderApp("/courses/4");
    await screen.findByRole("heading", { name: CS402 });
    await logInFromHeader(user, "admin");
    await user.click(await screen.findByRole("link", { name: "Edit course" }));
    expect(await screen.findByRole("heading", { name: "Edit CS402" })).toBeInTheDocument();
    expect(screen.getByLabelText("Code")).toHaveValue("CS402");
    expect(screen.getByLabelText("Title")).toHaveValue("Enterprise Software Development");
    expect(screen.getByLabelText("Credits")).toHaveValue(4);
    expect(screen.getByLabelText("Capacity")).toHaveValue(3);
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
  });

  test("Save changes PUTs the whole course with the token, then shows the course as saved", async () => {
    const { user } = await editAsAdmin();
    await setField(user, "Title", "Enterprise Software Development II");
    await setField(user, "Capacity", "60");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByRole("heading", { name: "CS402 · Enterprise Software Development II" })).toBeInTheDocument();
    expect(screen.getByText("60 seats left")).toBeInTheDocument();
    const put = server.requests().find((r) => r.method === "PUT");
    expect(put).toMatchObject({
      path: "/api/courses/4",
      body: { code: "CS402", title: "Enterprise Software Development II", department: "Computer Science", credits: 4, capacity: 60 },
    });
    expect(put.auth).toMatch(/^Bearer \S+$/);
  });

  test("capacity below the current enrollments: the server's 409, shown in the form", async () => {
    for (const who of ["student", "riya"]) {
      const token = await server.tokenFor(who);
      await server.call("POST", "/api/enrollments", { token, body: { courseId: 4 } });
    }
    const { user } = await editAsAdmin();
    await setField(user, "Capacity", "1");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Capacity is below current enrollments");
    expect(screen.getByLabelText("Capacity")).toHaveValue(1); // still what was typed
  });

  test("a bad value: the server's fieldErrors message under that field", async () => {
    const { user } = await editAsAdmin();
    await setField(user, "Code", "cs-402");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await screen.findByRole("alert");
    expect(screen.getByLabelText("Code")).toHaveAccessibleDescription(/uppercase letters/);
  });

  test("Delete asks first — and Cancel deletes nothing", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    const { user } = await editAsAdmin();
    await user.click(screen.getByRole("button", { name: "Delete course" }));
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(server.requests().some((r) => r.method === "DELETE")).toBe(false);
    expect(screen.getByRole("heading", { name: "Edit CS402" })).toBeInTheDocument();
  });

  test("Delete, confirmed: DELETE with the token, then the course list — without CS402", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const { user } = await editAsAdmin();
    await user.click(screen.getByRole("button", { name: "Delete course" }));
    expect(await screen.findByRole("heading", { name: "Courses" })).toBeInTheDocument();
    await screen.findByRole("link", { name: "CS305 · Database Systems" });
    expect(screen.queryByRole("link", { name: CS402 })).not.toBeInTheDocument();
    const del = server.requests().find((r) => r.method === "DELETE");
    expect(del).toMatchObject({ path: "/api/courses/4" });
    expect(del.auth).toMatch(/^Bearer \S+$/);
  });

  test("New course still works, unchanged: \"Add a course\", \"Add course\", empty fields", async () => {
    const { user } = renderApp("/");
    await logInFromHeader(user, "admin");
    await user.click(header().getByRole("link", { name: "New course" }));
    expect(await screen.findByRole("heading", { name: "Add a course" })).toBeInTheDocument();
    expect(screen.getByLabelText("Code")).toHaveValue("");
    for (const [label, value] of Object.entries({ Code: "CS610", Title: "Cloud Computing", Department: "Computer Science", Credits: "4", Capacity: "60" })) {
      await user.type(screen.getByLabelText(label), value);
    }
    await user.click(screen.getByRole("button", { name: "Add course" }));
    expect(await screen.findByRole("heading", { name: "CS610 · Cloud Computing" })).toBeInTheDocument();
  });
});
