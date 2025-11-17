import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
// export default defineConfig(({ mode }) => ({
//   server: {
//     host: "::",
//     port: 8080,
//   },
//   plugins: [
//     react(),
//     mode === 'development' &&
//     componentTagger(),
//   ].filter(Boolean),
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// }));



export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
    //  Vitest Configuration
  test: {
    globals: true,           // lets you use describe/it/expect globally
    environment: 'happy-dom',    // simulates the browser environment for React
    setupFiles: './src/setupTests.js', // setup file for test utilities
    coverage: {
      reporter: ['text', 'json', 'html'], // optional: code coverage report
    },
  },
}));