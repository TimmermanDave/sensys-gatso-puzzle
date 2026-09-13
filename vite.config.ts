import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createApiHandler } from './server/api';

const reportPaths = [
  '/reports/vitest/index.html',
  '/reports/playwright/html/index.html',
  '/reports/lighthouse/index.html',
];

export default defineConfig({
  root: 'client',
  build: { outDir: '../dist', emptyOutDir: true },
  server: { fs: { allow: [fileURLToPath(new URL('.', import.meta.url))] } },
  define: {
    'import.meta.env.GAME_TEST_REPORT_PATHS': JSON.stringify(
      reportPaths.filter((path) =>
        existsSync(new URL(`.${path}`, import.meta.url)),
      ),
    ),
  },
  plugins: [
    {
      name: 'puzzle-api',
      configureServer(server) {
        const handler = createApiHandler();
        server.middlewares.use((req, res, next) => {
          // Reports remain at the repository root, outside the client root.
          if (req.url?.startsWith('/reports/')) {
            req.url = `/@fs/${fileURLToPath(new URL('.', import.meta.url)).replaceAll('\\', '/')}${req.url.slice(1)}`;
          }
          if (req.url?.startsWith('/api/')) void handler(req, res);
          else next();
        });
      },
      configurePreviewServer(server) {
        const handler = createApiHandler();
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/api/')) void handler(req, res);
          else next();
        });
      },
    },
    react(),
    {
      name: 'inline-small-entry-css',
      apply: 'build',
      transformIndexHtml: {
        order: 'post',
        handler(html, context) {
          return html.replace(/<link\b[^>]*rel="stylesheet"[^>]*>/g, (link) => {
            const href = link.match(/href="([^"]+)"/)?.[1];
            const asset = Object.values(context.bundle ?? {}).find((entry) =>
              href?.endsWith(`/${entry.fileName}`),
            );
            if (asset?.type !== 'asset') return link;
            const css = asset.source.toString();
            // Keep larger stylesheets cacheable and preserve relative asset URLs.
            if (
              Buffer.byteLength(css) > 8192 ||
              /url\s*\(|@import|<\/style/i.test(css)
            ) {
              return link;
            }
            return `<style>${css}</style>`;
          });
        },
      },
    },
  ],
  test: {
    root: '.',
    environment: 'jsdom',
    setupFiles: ['./client/__tests__/setup.ts'],
    include: ['client/**/__tests__/*.test.{ts,tsx}', 'server/**/*.test.ts'],
    clearMocks: true,
    restoreMocks: true,
    reporters: ['default', 'html'],
    outputFile: { html: './reports/vitest/index.html' },
    coverage: { reportsDirectory: './reports/vitest/coverage' },
  },
});
