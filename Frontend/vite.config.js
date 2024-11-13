import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_URL,
          changeOrigin: true,
          secure: true,
          ws: true,
        },
      },
      strictPort: true,
    },
    build: {
      outDir: "dist",
      sourcemap: mode === "development",
    },
    define: {
      "process.env": {},
    },
  };
});
