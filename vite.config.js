import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * OKZ Sports - Vite Configuration
 * Configured for React Router & JSX Support
 */
export default defineConfig({
  // 1. Enable React Support (compiles JSX/TSX)
  plugins: [react()],

  // 2. Server Settings
  server: {
    port: 3000,
    open: true, // Automatically opens browser on 'npm run dev'
    cors: true,
  },

  // 3. Build Settings
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Ensures clean builds for deployment to Render
    emptyOutDir: true,
  },

  // 4. Resolve Aliases (Optional - makes imports cleaner)
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});