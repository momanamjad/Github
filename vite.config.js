import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      disable: true,
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'logo-192.png', 'logo-512.png', 'maskable-logo-512.png', 'customIcons/**/*'],
      manifest: false, // we use our own public/manifest.json
      workbox: {
        // Cache-first for all static assets (JS/CSS/fonts/images)
        globPatterns: ['**/*.{js,css,html,ico,webp,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            // Gemini API — network-first with graceful offline fallback
            urlPattern: /^https:\/\/generativelanguage\.googleapis\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'gemini-api-cache',
              networkTimeoutSeconds: 10,
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 }, // 1 hour
            },
          },
          {
            // GitHub Avatars and external images — stale-while-revalidate
            urlPattern: /^https:\/\/avatars\.githubusercontent\.com\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'gh-avatars-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 }, // 7 days
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@':           path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@common':     path.resolve(__dirname, './src/components/common'),
      '@layout':     path.resolve(__dirname, './src/components/layout'),
      '@features':   path.resolve(__dirname, './src/components/features'),
      '@ui':         path.resolve(__dirname, './src/components/ui'),
      '@pages':      path.resolve(__dirname, './src/pages'),
      '@services':   path.resolve(__dirname, './src/services'),
      '@utils':      path.resolve(__dirname, './src/utils'),
      '@lib':        path.resolve(__dirname, './src/lib'),
      '@hooks':      path.resolve(__dirname, './src/hooks'),
      '@constants':  path.resolve(__dirname, './src/constants'),
      '@contexts':   path.resolve(__dirname, './src/contexts'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Split vendor chunks for better cache utilisation across deploys
        manualChunks: {
          'react-core':   ['react', 'react-dom', 'react-router-dom'],
          'ui-libs':      ['lucide-react', '@primer/octicons-react'],
          'markdown':     ['react-markdown', 'rehype-sanitize'],
          'dnd':          ['@dnd-kit/core', '@dnd-kit/sortable'],
          'radix':        [
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dialog',
            '@radix-ui/react-label',
            '@radix-ui/react-select',
          ],
        },
      },
    },
  },
});
