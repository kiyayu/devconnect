import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  // Load environment variables based on the mode (development or production)
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: env.VITE_API_URL, // Uses environment variable
          changeOrigin: true,
          secure: true,
          ws: true, // Enable WebSocket proxy
        },
      },
      port: 3000,
      strictPort: true,
    },
    build: {
      outDir: "dist",
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: [
              "react",
              "react-dom",
              "react-router-dom",
              "socket.io-client",
            ],
            utils: ["axios", "jwt-decode"],
          },
        },
      },
      chunkSizeWarningLimit: 1500,
      sourcemap: command === "serve",
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
    base: command === "build" ? "/" : "", // Use base path in production if needed
  };
});
