import { defineConfig } from 'vite';

export default defineConfig({
  // Base public path for GitHub Pages deployment
  // Set to '/' for custom domain or '/repo-name/' for GitHub Pages
  base: './',

  // Build configuration
  build: {
    // Output directory for production build
    outDir: 'dist',

    // Generate sourcemaps for debugging (disabled for production)
    sourcemap: false,

    // Minify with esbuild for better performance
    minify: 'esbuild',

    // Target modern browsers for optimal output
    target: 'es2015',

    // CSS minification
    cssMinify: true,

    // Optimize chunk splitting
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: (id) => {
          // Vendor chunk for node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          // Analytics chunk for analytics-related code
          if (id.includes('analytics')) {
            return 'analytics';
          }
        },
        // Asset file naming with hash for cache busting
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return 'assets/images/[name]-[hash][extname]';
          } else if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },

    // Asset inlining threshold (in bytes) - inline small assets
    assetsInlineLimit: 4096,

    // Enable CSS code splitting for better performance
    cssCodeSplit: true,

    // Empty output directory before building
    emptyOutDir: true,

    // Report compressed size
    reportCompressedSize: true,

    // Chunk size warning limit (in KB)
    chunkSizeWarningLimit: 500,
  },

  // Server configuration for development
  server: {
    port: 3000,
    host: true,
    open: true,
    strictPort: false,
    // Enable compression in dev mode
    cors: true,
  },

  // Preview server configuration
  preview: {
    port: 4173,
    host: true,
    strictPort: false,
    cors: true,
  },

  // CSS configuration
  css: {
    postcss: './postcss.config.js',
    // CSS modules configuration
    modules: {
      localsConvention: 'camelCase',
    },
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [],
    exclude: [],
  },

  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
});
