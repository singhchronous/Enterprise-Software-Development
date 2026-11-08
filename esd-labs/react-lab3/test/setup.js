// Runs before every test file: adds matchers like toBeInTheDocument(), and after each test
// unmounts whatever it rendered, puts back anything it stubbed (like fetch) and empties the
// browser storage, so tests can't see each other's screens, servers or sessions.
import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  sessionStorage.clear();
  localStorage.clear();
});
