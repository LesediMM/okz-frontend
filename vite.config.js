import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Base public path when served in production
  base: '/',
  
  // Development server configuration
  server: {
    port: 3000,
    host: true, // Listen on all addresses
    open: true, // Automatically open browser
    cors: true,
    
    // Proxy API requests to backend during development
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/v1')
      },
      '/health': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    },
    
    // Enable HTTPS for local development (optional)
    // https: {
    //   key: './localhost-key.pem',
    //   cert: './localhost.pem'
    // },
    
    // Watch configuration
    watch: {
      usePolling: true, // Useful for Docker/WSL
      interval: 100
    },
    
    // HMRS (Hot Module Replacement) configuration
    hmr: {
      overlay: true // Show error overlay
    }
  },
  
  // Preview server configuration (for production build preview)
  preview: {
    port: 3001,
    host: true,
    open: false
  },
  
  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true, // Generate source maps
    minify: 'terser', // Use terser for minification
    target: 'es2020',
    
    // Rollup configuration
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        // Code splitting configuration
        manualChunks: {
          vendor: ['chart.js', 'date-fns'],
          components: [
            './src/components/Layout.js',
            './src/components/Navbar.js',
            './src/components/Footer.js'
          ],
          pages: [
            './src/pages/Home.js',
            './src/pages/UserLogin.js',
            './src/pages/UserRegister.js',
            './src/pages/UserDashboard.js',
            './src/pages/Booking.js',
            './src/pages/MyBookings.js',
            './src/pages/AdminLogin.js',
            './src/pages/AdminDashboard.js',
            './src/pages/AdminBookings.js'
          ]
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: ({name}) => {
          if (/\.(gif|jpe?g|png|svg|webp|avif)$/.test(name ?? '')) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (/\.(ttf|otf|fnt|woff2?)$/.test(name ?? '')) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          if (/\.css$/.test(name ?? '')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    
    // Terser options for minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true
      },
      format: {
        comments: false // Remove comments
      }
    },
    
    // Build optimization
    cssCodeSplit: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000, // Warn for chunks > 1MB
    
    // Asset handling
    assetsInlineLimit: 4096 // Files smaller than 4kb will be inlined as base64
  },
  
  // CSS configuration
  css: {
    devSourcemap: true, // Source maps in development
    preprocessorOptions: {
      // You could add SCSS/SASS support here
      // scss: {
      //   additionalData: `@import "./src/styles/variables.scss";`
      // }
    }
  },
  
  // Environment variables
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version || '1.0.0'),
    'import.meta.env.VITE_BUILD_TIME': JSON.stringify(new Date().toISOString())
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@api': resolve(__dirname, 'src/api'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@styles': resolve(__dirname, 'src/styles')
    },
    extensions: ['.js', '.json', '.css']
  },
  
  // Plugin configuration
  plugins: [
    // You can add Vite plugins here
    // Example: vite-plugin-pwa for PWA support
    // Example: @vitejs/plugin-legacy for legacy browser support
  ],
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['chart.js', 'date-fns'],
    exclude: []
  },
  
  // Log level
  logLevel: 'info', // 'info', 'warn', 'error', 'silent'
  
  // Clear screen on restart
  clearScreen: true,
  
  // Mode configuration
  mode: process.env.NODE_ENV || 'development',
  
  // Environment-specific configuration
  envPrefix: ['VITE_', 'OKZ_'], // Prefix for client-side environment variables
  
  // Public directory
  publicDir: 'public',
  
  // Cache directory
  cacheDir: '.vite',
  
  // Custom logger (optional)
  // customLogger: {
  //   info: (msg) => console.log(`[OKZ] ${msg}`),
  //   warn: (msg) => console.warn(`[OKZ] ⚠️ ${msg}`),
  //   error: (msg) => console.error(`[OKZ] ❌ ${msg}`)
  // }
});

// Environment-specific overrides
// if (process.env.NODE_ENV === 'production') {
//   export default defineConfig({
//     ...baseConfig,
//     build: {
//       ...baseConfig.build,
//       minify: 'terser',
//       sourcemap: false
//     }
//   });
// } else {
//   export default defineConfig(baseConfig);
// }