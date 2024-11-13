import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_URL, // Proxy to backend URL in development
          changeOrigin: true,
          secure: false,
          ws: true, // Enables WebSocket support
        },
      },
      port: 3000,
      strictPort: true,
    },
    build: {
      outDir: "dist",
      sourcemap: mode === "development",
    },
  };
});
