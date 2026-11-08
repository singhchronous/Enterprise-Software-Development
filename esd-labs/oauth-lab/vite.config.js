import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { mockApi } from "./mock/vite-plugin.js";

// npm run dev serves the app AND the mock course API (/api) on http://localhost:5173 — the
// origin the course's Google client ID allows (section 06), and the one your backend's CORS
// allows (React Lab 4). strictPort: if 5173 is taken, stop with an error rather than quietly
// move to 5174, which Google and your backend would both refuse.
//
// .env       ships with the course's Google client ID, VITE_GOOGLE_CLIENT_ID (public). The mock
//            gets it too, so it can verify real Google ID tokens against Google's published keys.
// .env.local is yours (never committed) and wins over .env. With VITE_API_URL in it, the app
//            talks to your own backend and the mock is left out (React Lab 4; section 15 here).
//
// Tests:  npm test             → test/**/*.test.{js,jsx}, except test/stretch/
//         npm run test:stretch → test/stretch/ only
//         npm run test:all     → both
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const core = ["test/**/*.test.{js,jsx}"];
  const stretch = ["test/stretch/**/*.test.{js,jsx}"];
  const include = { stretch, all: core }[mode] ?? core;
  return {
    plugins: [react(), env.VITE_API_URL ? null : mockApi({ googleClientId: env.VITE_GOOGLE_CLIENT_ID })],
    server: { port: 5173, strictPort: true },
    test: {
      environment: "jsdom",
      setupFiles: ["./test/setup.js"],
      include,
      exclude: mode === "stretch" || mode === "all" ? [] : stretch,
      restoreMocks: true,
      unstubEnvs: true,
    },
  };
});
