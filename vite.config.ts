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
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Generate unique hashes for all assets (cache-busting)
    rollupOptions: {
      output: {
        // Ensure unique filenames for cache-busting
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,

        // Manual chunking to split large dependencies
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // UI library (Radix UI components)
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slot',
          ],

          // Supabase
          'supabase-vendor': ['@supabase/supabase-js'],

          // React Query
          'query-vendor': ['@tanstack/react-query'],

          // Other large dependencies
          'utils-vendor': ['zod', 'date-fns', 'lucide-react'],
        },
      },
    },
    // Increase chunk size warning limit (we're handling it with chunking)
    chunkSizeWarningLimit: 1000,

    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production', // Remove console.logs in production
      },
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