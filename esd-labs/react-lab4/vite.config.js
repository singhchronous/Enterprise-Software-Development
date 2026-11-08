import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { mockApi } from "./mock/vite-plugin.js";

// npm run dev serves the app AND the mock course API (/api) on http://localhost:5173.
//
// Your own backend (section 09): put VITE_API_URL=http://localhost:8080 in .env.local and
// restart npm run dev. Then the mock plugin below is left out, and the app calls your
// backend directly — a different origin, so your backend must answer with CORS headers.
//
// Port 5173 and strictPort: the contract's CORS rule allows http://localhost:5173 and
// nothing else. If 5173 is taken, Vite stops with an error instead of quietly moving to
// 5174 — where every request would be blocked by CORS.
//
// Vite answers any path it doesn't know (/me, /courses/4 …) with index.html, so a reload
// or a typed-in URL still reaches the app and the router picks the page.
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
