// Section 10: "Logged in as <name>" with a role badge in the header.
import { beforeEach, expect, test } from "vitest";
import { stubFetch } from "./support/fetch.js";
import { header, logInFromHeader, renderApp } from "./support/app.jsx";

beforeEach(() => {
  stubFetch();
});

test("an admin sees their name and the ADMIN badge", async () => {
  const { user } = renderApp("/");
  await logInFromHeader(user, "admin");
  expect(header().getByText(/Logged in as/)).toBeInTheDocument();
  expect(header().getByText("Course Admin")).toBeInTheDocument();
  expect(header().getByText("ADMIN")).toBeInTheDocument();
});

test("a student sees the STUDENT badge", async () => {
  const { user } = renderApp("/");
  await logInFromHeader(user, "student");
  expect(header().getByText("STUDENT")).toBeInTheDocument();
});
