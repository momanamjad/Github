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
      disable: false,
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'logo-192.png', 'logo-512.png', 'maskable-logo-512.png'],
      manifest: false, // we use our own public/manifest.json
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,webp,png,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // skip files >3MB from precache
        runtimeCaching: [
          {
            // Repositories listing cache - StaleWhileRevalidate
            urlPattern: /\/api\/repos(?:\?.*)?$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-repos-list-cache',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 50, maxAgeSeconds: 5 * 60 }, // 5 minutes
            },
          },
          {
            // Repository details - CacheFirst (e.g. read-heavy branches/trees)
            urlPattern: /\/api\/repos\/[^/]+(?:\?.*)?$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'api-repo-details-cache',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 200, maxAgeSeconds: 2 * 60 }, // 2 minutes
            },
          },
          {
            // Users and auth profile - NetworkFirst
            urlPattern: /\/api\/users(?:\/.*)?$|\/api\/auth\/me$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-users-cache',
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 50, maxAgeSeconds: 30 }, // 30 seconds
            },
          },
          {
            // Backend API default fallback
            urlPattern: /^https:\/\/github-backend\.vercel\.app\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-default-cache',
              networkTimeoutSeconds: 8,
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 100, maxAgeSeconds: 30 },
            },
          },
          {
            // Gemini API — network-first with offline fallback
            urlPattern: /^https:\/\/generativelanguage\.googleapis\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'gemini-api-cache',
              networkTimeoutSeconds: 10,
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 },
            },
          },
          {
            // GitHub Avatars — stale-while-revalidate, 7 days
            urlPattern: /^https:\/\/avatars\.githubusercontent\.com\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'gh-avatars-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
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
    chunkSizeWarningLimit: 300,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Isolate React runtime vendor bundle
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
            return 'vendor-react';
          }
          // Heavy editor — only loaded on repo file view
          if (id.includes('@monaco-editor') || id.includes('monaco-editor')) return 'monaco';
          // Terminal emulator — only on /terminal
          if (id.includes('xterm')) return 'xterm';
          // Socket.io — only when WS connected
          if (id.includes('socket.io-client') || id.includes('engine.io-client')) return 'socket';
          // Drag and drop — only on projects/kanban
          if (id.includes('@dnd-kit')) return 'dnd';
          // Markdown — only in repo/wiki views
          if (id.includes('react-markdown') || id.includes('rehype') || id.includes('remark') ||
              id.includes('unified') || id.includes('micromark') || id.includes('mdast') || id.includes('hast')) return 'markdown';
          // Radix UI primitives
          if (id.includes('@radix-ui')) return 'radix';
          // Icon sets
          if (id.includes('@primer/octicons-react')) return 'octicons';
          if (id.includes('lucide-react')) return 'lucide';
        },
      },
    },
  },
});
