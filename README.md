# Sensys Gatso Puzzle

A small React + TypeScript sliding puzzle, built to demonstrate important facets of frontend development in one approachable app: clear architecture, reusable UI, accessible interactions, testing, and container delivery.

Play a solvable 3×3, 4×4, or 5×5 puzzle with clicks or arrow keys. Restart the same board or try a new one.

## What’s inside

- **Predictable logic:** pure, immutable puzzle functions and seeded shuffling through legal moves.
- **Composable React:** a game hook and scoped context, reusable components, and an error boundary. The puzzle loads with the main bundle to avoid extra requests before the first render.
- **Focused styling:** CSS modules, shared theme tokens, a CSS logo, and reduced-motion support.
- **Useful tests:** Vitest for logic and interactions, Playwright for the browser flow, and Lighthouse for page audits.
- **Small runtime:** Vite builds static assets served by non-root Nginx, with a read-only Docker filesystem and dropped capabilities.

## Get started

Node.js 22+, npm, and Chrome for Lighthouse. Docker is optional.

```sh
npm ci
npx playwright install chromium
npm run dev
```

## Scripts

| Command                     | Purpose                                                   |
| --------------------------- | --------------------------------------------------------- |
| `npm run dev`               | Start the development server at localhost:5173.           |
| `npm run build`             | Type-check and build production assets.                   |
| `npm run preview`           | Serve the production build at localhost:4173.             |
| `npm run up`                | Build and start Docker at localhost:8080.                 |
| `npm test`                  | Run unit/component tests and update the HTML report.      |
| `npm run test:watch`        | Rerun unit/component tests while editing.                 |
| `npm run test:e2e`          | Run the Chromium browser test and update its HTML report. |
| `npm run test:report`       | Alias for `npm test`.                                     |
| `npm run test:e2e:report`   | Alias for `npm run test:e2e`.                             |
| `npm run lighthouse:report` | Build, start a preview, audit it, and stop the preview.   |
| `npm run report`            | Run tests, then build and generate the Lighthouse report. |
| `npm run format`            | Format source files.                                      |
| `npm run format:check`      | Check formatting.                                         |

Run `npm run lighthouse:report` on its own; it starts a production preview on port 4173 and stops it after the audit, including when the audit fails. The pinned Lighthouse CLI downloads on first use. Development uses port 5173; preview and browser tests use port 4173. Servers fail if their port is occupied instead of switching to another port. Stop any manual preview before running Lighthouse. Stop Docker with `docker compose down`.

## Reports

Reports update without opening a browser or report viewer:

In development, links below the puzzle open the generated reports in new tabs. Run `npm run report` to generate them first. These links are excluded from production builds, including Docker images.

- `reports/vitest/index.html`
- `reports/playwright/html/index.html`
- `reports/lighthouse/index.html`

Supporting assets, traces, and optional coverage stay inside those three folders. All reports are ignored by Git. To inspect Vitest interactively, explicitly run `npx vite preview --outDir reports/vitest --port 4174`; for Playwright, run `npx playwright show-report reports/playwright/html`.
