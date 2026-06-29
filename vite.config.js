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
            // Backend API — network-first, short cache
            urlPattern: /^https:\/\/github-backend\.vercel\.app\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
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
    rollupOptions: {
      output: {
        manualChunks(id) {
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
          // React core + router
          if (id.includes('react-dom') || id.includes('react-router-dom') || id.includes('/node_modules/react/')) return 'react-core';
          // Everything else in node_modules
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
});
