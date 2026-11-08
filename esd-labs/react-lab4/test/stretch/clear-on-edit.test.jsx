// Stretch, section 07: a field's message goes away as soon as you edit that field —
// and only that field's.
import { beforeEach, expect, test } from "vitest";
import { screen } from "@testing-library/react";
import { stubFetch } from "../support/fetch.js";
import { renderApp } from "../support/app.jsx";

beforeEach(() => {
  stubFetch();
});

test("typing in Email clears Email's message; Password's stays until you edit Password", async () => {
  const { user } = renderApp("/signup");
  await user.type(await screen.findByLabelText("Email"), "not-an-email");
  await user.type(screen.getByLabelText("Password"), "short");
  await user.click(screen.getByRole("button", { name: "Sign up" }));
  await screen.findByText("must be a well-formed email address");

  await user.type(screen.getByLabelText("Email"), "x");
  expect(screen.queryByText("must be a well-formed email address")).not.toBeInTheDocument();
  expect(screen.getByLabelText("Email")).not.toHaveAttribute("aria-invalid");
  expect(screen.getByLabelText("Password")).toHaveAccessibleDescription("size must be between 8 and 64");

  await user.type(screen.getByLabelText("Password"), "-and-longer");
  expect(screen.getByLabelText("Password")).not.toHaveAccessibleDescription();
});
