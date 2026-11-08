// Stretch, section 07: the login page shows the server's fieldErrors too, under each field.
import { beforeEach, expect, test } from "vitest";
import { screen } from "@testing-library/react";
import { stubFetch } from "../support/fetch.js";
import { renderApp } from "../support/app.jsx";

beforeEach(() => {
  stubFetch();
});

test("Log in with nothing filled in: a message under Email and under Password", async () => {
  const { user } = renderApp("/login");
  await user.click(screen.getByRole("button", { name: "Log in" }));
  await screen.findByText("must be a well-formed email address");
  expect(screen.getByLabelText("Email")).toHaveAccessibleDescription("must be a well-formed email address");
  expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  expect(screen.getByLabelText("Password")).toHaveAccessibleDescription("must not be blank");
});

test("a wrong password has no fieldErrors: nothing under the fields, just the message", async () => {
  const { user } = renderApp("/login");
  await user.type(screen.getByLabelText("Email"), "student@esd.local");
  await user.type(screen.getByLabelText("Password"), "not-my-password");
  await user.click(screen.getByRole("button", { name: "Log in" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password");
  expect(screen.getByLabelText("Email")).not.toHaveAttribute("aria-invalid");
  expect(screen.getByLabelText("Password")).not.toHaveAccessibleDescription();
});
