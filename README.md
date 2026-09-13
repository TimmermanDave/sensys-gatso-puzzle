# Sensys Gatso Puzzle

A small React + TypeScript sliding puzzle with a minimal Node HTTP API. The server creates puzzles, validates moves, counts them, and restarts the original board. React displays the returned state.

Play a solvable 3×3, 4×4, or 5×5 puzzle with clicks or arrow keys. Restart the same board or try a new one.

## Get started

Node.js 22+, npm, and Chrome for Lighthouse.

```sh
npm ci
npm run dev
```

Docker is optional.

```sh
npm run up
```

For tests.

```sh
npx playwright install chromium
npm run report
```

## What’s inside

- **Predictable logic:** pure, immutable puzzle functions and seeded shuffling through legal moves.
- **Composable React:** a game hook and scoped context, reusable components, and an error boundary. The puzzle loads with the main bundle to avoid extra requests before the first render.
- **Focused styling:** CSS modules, shared theme tokens, a CSS logo, and reduced-motion support.
- **Useful tests:** Vitest for logic and interactions, Playwright for the browser flow, and Lighthouse for page audits.
- **Small runtime:** Vite builds static assets served by non-root Nginx, which forwards `/api/` to a separate Node process. No additional runtime packages.

## Minimal backend

Small stack, clear responsibilities: `client/` renders the game; `server/` owns the rules, state, and API contracts. No extra runtime packages.

- **Develop:** `npm run dev` starts the client and API together.
- **Preview:** `npm run preview` serves the built client with the API.
- **Docker:** `npm run up` runs Nginx and Node at `localhost:8080`.
- **API only:** `npm run build:api`, then `npm run start:api` (port 3001).

| Endpoint                      | Body                           | Action                  |
| ----------------------------- | ------------------------------ | ----------------------- |
| `POST /api/games`             | `{ "size": 3 }`                | New puzzle              |
| `GET /api/games/:id`          | —                              | Current state           |
| `POST /api/games/:id/moves`   | `{ "index": 0, "version": 0 }` | Move a tile             |
| `POST /api/games/:id/restart` | `{ "version": 1 }`             | Restart the same puzzle |

Every success returns the board, legal moves, move count, and version. React waits for the response; version checks reject stale commands, and Retry reloads server state after a failed request.

**Tests span both sides.** Vitest covers client and server; Playwright plays through the real API; Lighthouse audits the built page with the API running. E2E uses Vite by default—set `PLAYWRIGHT_BASE_URL` to test a running Docker deployment.

**Kept small for the demo:** no authn/authz, database, rate limiting, or game cleanup. Anyone with a game ID can change it. Games live in one process: refresh starts a new puzzle, and a server restart clears them all. Production security and monitoring, offline play, and multiplayer are left for a next step.

## Scripts

| Command                | Purpose                                                   |
| ---------------------- | --------------------------------------------------------- |
| `npm run dev`          | Start the development server at localhost:5173.           |
| `npm run build`        | Type-check and build production assets.                   |
| `npm run preview`      | Serve the production build at localhost:4173.             |
| `npm run up`           | Build and start Docker at localhost:8080.                 |
| `npm test`             | Run unit/component tests and update the HTML report.      |
| `npm run test:watch`   | Rerun unit/component tests while editing.                 |
| `npm run test:e2e`     | Run the Chromium browser test and update its HTML report. |
| `npm run lighthouse`   | Build, start a preview, audit it, and stop the preview.   |
| `npm run report`       | Run tests, then build and generate the Lighthouse report. |
| `npm run format`       | Format source files.                                      |
| `npm run format:check` | Check formatting.                                         |

## Reports

In development, links below the puzzle open the generated reports in new tabs. Run `npm run report` to generate them first. These links are **excluded** from production builds.

- `reports/vitest/index.html`
- `reports/playwright/html/index.html`
- `reports/lighthouse/index.html`
