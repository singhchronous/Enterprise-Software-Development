// Stretch, section 05: NavLink marks the link to the page you're on.
import { beforeEach, expect, test } from "vitest";
import { stubFetch } from "../support/fetch.js";
import { header, logInFromHeader, renderApp } from "../support/app.jsx";

beforeEach(() => {
  stubFetch();
});

test("the header marks the current page's link (aria-current=\"page\")", async () => {
  const { user } = renderApp("/");
  expect(header().getByRole("link", { name: "Courses" })).toHaveAttribute("aria-current", "page");
  expect(header().getByRole("link", { name: "My courses" })).not.toHaveAttribute("aria-current");

  await logInFromHeader(user, "student");
  await user.click(header().getByRole("link", { name: "My courses" }));
  expect(await header().findByRole("link", { name: "My courses", current: "page" })).toBeInTheDocument();
  expect(header().getByRole("link", { name: "Courses" })).not.toHaveAttribute("aria-current");
});
