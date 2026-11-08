// Section 10: keep the session in sessionStorage, so a reload doesn't log you out.
import { beforeEach, expect, test } from "vitest";
import { screen } from "@testing-library/react";
import { stubFetch } from "./support/fetch.js";
import { header, logInFromHeader, renderApp } from "./support/app.jsx";

beforeEach(() => {
  stubFetch();
});

test("a reload keeps you logged in", async () => {
  const first = renderApp("/");
  await logInFromHeader(first.user, "student");
  first.unmount(); // the page goes away, as on a reload — sessionStorage stays

  renderApp("/me");
  expect(await screen.findByRole("heading", { name: "My courses" })).toBeInTheDocument();
  expect(header().getByText("Sam Student")).toBeInTheDocument();
});

test("after Log out, a reload finds nobody logged in", async () => {
  const first = renderApp("/");
  await logInFromHeader(first.user, "student");
  await first.user.click(header().getByRole("button", { name: "Log out" }));
  await header().findByRole("link", { name: "Log in" });
  first.unmount();

  renderApp("/me");
  expect(await screen.findByRole("heading", { name: "Log in" })).toBeInTheDocument();
});
