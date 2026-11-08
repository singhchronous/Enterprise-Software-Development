// Runs before every test file: adds matchers like toBeInTheDocument(), and after each test
// unmounts whatever it rendered, puts back anything it stubbed (fetch, env variables), empties
// the browser storage, and removes the pretend Google — so tests can't see each other's
// screens, servers, sessions or Google.
import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  sessionStorage.clear();
  localStorage.clear();
  delete window.google;
  document.head.querySelectorAll('script[src*="accounts.google.com"]').forEach((script) => script.remove());
});
