import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
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
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/__tests__/*.test.{ts,tsx}'],
    clearMocks: true,
    restoreMocks: true,
    reporters: ['default', 'html'],
    outputFile: { html: './reports/vitest/index.html' },
    coverage: { reportsDirectory: './reports/vitest/coverage' },
  },
});
