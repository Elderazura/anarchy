import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["framer-motion"],
  },
  resolve: {
    conditions: ["browser", "module", "import", "default"],
  },
  test: {
    environment: "jsdom",
    include: ["src/tests/**/*.test.js"],
  },
});
