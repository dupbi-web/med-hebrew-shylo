import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

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
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/setupTests.js',
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
}));