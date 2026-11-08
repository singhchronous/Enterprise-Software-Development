// Section 11: the header's "Log in" link remembers where you were.
import { beforeEach, expect, test } from "vitest";
import { screen } from "@testing-library/react";
import { stubFetch } from "./support/fetch.js";
import { header, renderApp, submitLogin } from "./support/app.jsx";

beforeEach(() => {
  stubFetch();
});

test("deep link to a course, Log in from the header, land back on that course", async () => {
  const { user } = renderApp("/courses/4");
  await screen.findByRole("heading", { name: "CS402 · Enterprise Software Development" });
  await user.click(header().getByRole("link", { name: "Log in" }));
  await submitLogin(user, "student");
  expect(await screen.findByRole("heading", { name: "CS402 · Enterprise Software Development" })).toBeInTheDocument();
});

test("a redirect from /me still wins if you press the header's Log in on the login page", async () => {
  const { user } = renderApp("/me");
  await screen.findByRole("heading", { name: "Log in" });
  await user.click(header().getByRole("link", { name: "Log in" }));
  await submitLogin(user, "student");
  expect(await screen.findByRole("heading", { name: "My courses" })).toBeInTheDocument();
});
