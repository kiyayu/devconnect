import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  const config = {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: process.env.VITE_API_URL,
          changeOrigin: true,
          secure: true,
          ws: true, // Enable WebSocket proxy
        },
      },
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
      "process.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL),
    },
  };

  if (command === "serve") {
    // Development-specific settings
    config.server.port = 3000;
    config.server.strictPort = true;
  } else {
    // Production-specific settings
    config.base = "/"; // or your specific base path if deployed to a subdirectory
  }

  return config;
});
