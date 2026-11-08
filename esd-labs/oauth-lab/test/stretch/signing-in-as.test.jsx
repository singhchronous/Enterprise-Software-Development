// Stretch, section 10: while the backend checks the Google token, the login page says who
// it's signing in — read from the token with decodeJwtPayload, for display only.
import { beforeEach, expect, test, vi } from "vitest";
import { screen } from "@testing-library/react";
import { stubFetch } from "../support/fetch.js";
import { clickGoogle, header, renderApp } from "../support/app.jsx";
import { ASHA, CLIENT_ID, fakeGoogle } from "../support/google.js";

let server;
beforeEach(() => {
  server = stubFetch();
  fakeGoogle();
  vi.stubEnv("VITE_GOOGLE_CLIENT_ID", CLIENT_ID);
});

test("\"Signing in as asha.rao@example.com…\" while POST /api/auth/google is in flight", async () => {
  // Hold the backend's answer until we say so.
  let answer;
  const held = new Promise((resolve) => (answer = resolve));
  const real = server.fetch.getMockImplementation();
  server.fetch.mockImplementation(async (input, init) =>
    String(input).endsWith("/api/auth/google") ? (await held, real(input, init)) : real(input, init)
  );

  const { user } = renderApp("/login");
  await clickGoogle(user);
  expect(await screen.findByRole("status")).toHaveTextContent(`Signing in as ${ASHA.email}`);

  answer();
  expect(await header().findByText(ASHA.name)).toBeInTheDocument();
});
