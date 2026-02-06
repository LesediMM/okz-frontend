/**
 * vite.config.js
 * Configuration for OKZ Sports Frontend Deployment
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // The root of the project where index.html is located
  root: './',

  // Base public path when served in production
  base: '/',

  build: {
    // Output directory for the production build
    outDir: 'dist',
    
    // Ensures the build fails if there are missing imports
    emptyOutDir: true,

    // Rollup specific configurations
    rollupOptions: {
      input: {
        // Explicitly define index.html as the main entry point
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        // Organizes compiled assets into specific folders
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`
      }
    }
  },

  server: {
    // Port for local development
    port: 3000,
    // Enables proxying if you want to avoid CORS issues during local dev
    proxy: {
      '/api': {
        target: 'https://okz.onrender.com',
        changeOrigin: true,
        secure: true,
      }
    }
  },

  resolve: {
    alias: {
      // Allows cleaner imports like '@/api/auth'
      '@': resolve(__dirname, './src'),
    },
  },
});