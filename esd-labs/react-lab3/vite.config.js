import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { mockApi } from "./mock/vite-plugin.js";

// npm run dev serves the app AND the mock course API (/api) on http://localhost:5173.
// (Pointing the app at your own backend with VITE_API_URL is React Lab 4.)
//
// Vite answers any path it doesn't know (/me, /courses/4 …) with index.html, so a reload
// or a typed-in URL still reaches the app and the router picks the page (section 03).
//
// Tests:  npm test             → test/**/*.test.{js,jsx}, except test/stretch/
//         npm run test:stretch → test/stretch/ only
//         npm run inlab        → inlab/ only (the in-lab task)
//         npm run test:all     → all three
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const core = ["test/**/*.test.{js,jsx}"];
  const stretch = ["test/stretch/**/*.test.{js,jsx}"];
  const inlab = ["inlab/**/*.test.{js,jsx}"];
  const include = { stretch, inlab, all: [...core, ...inlab] }[mode] ?? core;
  return {
    plugins: [react(), env.VITE_API_URL ? null : mockApi()],
    server: { port: 5173, strictPort: true },
    test: {
      environment: "jsdom",
      setupFiles: ["./test/setup.js"],
      include,
      exclude: mode === "stretch" || mode === "all" ? [] : stretch,
      restoreMocks: true,
    },
  };
});
