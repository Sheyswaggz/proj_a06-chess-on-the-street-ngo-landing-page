import { defineConfig } from 'vite';

export default defineConfig({
  // Base public path for GitHub Pages deployment
  // Set to '/' for custom domain or '/repo-name/' for GitHub Pages
  base: './',

  // Build configuration
  build: {
    // Output directory for production build
    outDir: 'dist',

    // Generate sourcemaps for debugging
    sourcemap: false,

    // Minify with esbuild for better performance
    minify: 'esbuild',

    // Target modern browsers for optimal output
    target: 'es2015',

    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: undefined,
        // Asset file naming
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },

    // Asset inlining threshold (in bytes)
    assetsInlineLimit: 4096,

    // Enable CSS code splitting
    cssCodeSplit: true,

    // Emit assets during build
    emptyOutDir: true,
  },

  // Server configuration for development
  server: {
    port: 3000,
    host: true,
    open: true,
    strictPort: false,
  },

  // Preview server configuration
  preview: {
    port: 4173,
    host: true,
    strictPort: false,
  },

  // CSS configuration
  css: {
    postcss: './postcss.config.js',
  },
});
