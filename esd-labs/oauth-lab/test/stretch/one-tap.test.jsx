// Stretch, section 10: One Tap — GoogleSignInButton's oneTap prop, used by the login page.
import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GoogleSignInButton } from "../../src/auth/GoogleSignInButton.jsx";
import { stubFetch } from "../support/fetch.js";
import { renderApp } from "../support/app.jsx";
import { CLIENT_ID, fakeGoogle } from "../support/google.js";

test("with oneTap: prompt() once, after initialize — and cancel() when the button goes away", async () => {
  const id = fakeGoogle();
  const { unmount } = render(<GoogleSignInButton clientId={CLIENT_ID} onCredential={() => {}} oneTap />);
  await screen.findByRole("button", { name: "Sign in with Google" });
  expect(id.prompt).toHaveBeenCalledTimes(1);
  expect(id.initialize.mock.invocationCallOrder[0]).toBeLessThan(id.prompt.mock.invocationCallOrder[0]);
  unmount();
  expect(id.cancel).toHaveBeenCalled();
});

test("without oneTap: no prompt", async () => {
  const id = fakeGoogle();
  render(<GoogleSignInButton clientId={CLIENT_ID} onCredential={() => {}} />);
  await screen.findByRole("button", { name: "Sign in with Google" });
  expect(id.prompt).not.toHaveBeenCalled();
});

test("the login page offers One Tap", async () => {
  stubFetch();
  const id = fakeGoogle();
  vi.stubEnv("VITE_GOOGLE_CLIENT_ID", CLIENT_ID);
  renderApp("/login");
  await screen.findByRole("button", { name: "Sign in with Google" });
  expect(id.prompt).toHaveBeenCalledTimes(1);
});
