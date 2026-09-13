# Sensys Gatso Puzzle

A small React + TypeScript sliding puzzle with a minimal Node HTTP API. The server creates puzzles, validates moves, counts them, and restarts the original board. React displays the returned state.

Play a solvable 3×3, 4×4, or 5×5 puzzle with clicks or arrow keys. Restart the same board or try a new one.

## What’s inside

- **Predictable logic:** pure, immutable puzzle functions and seeded shuffling through legal moves.
- **Composable React:** a game hook and scoped context, reusable components, and an error boundary. The puzzle loads with the main bundle to avoid extra requests before the first render.
- **Focused styling:** CSS modules, shared theme tokens, a CSS logo, and reduced-motion support.
- **Useful tests:** Vitest for logic and interactions, Playwright for the browser flow, and Lighthouse for page audits.
- **Small runtime:** Vite builds static assets served by non-root Nginx, which forwards `/api/` to a separate Node process. No additional runtime packages.

## Minimal backend

The repository is organized into `client/` (React components, hooks, styles, HTML, public assets, and frontend tests) and `server/` (HTTP API, contracts, puzzle rules, and backend tests). Shared tooling and deployment configuration stay at the root. `e2e/` stays at the root because it tests the complete app.

`npm run test:e2e` starts Vite on port 4173, serving both the client and the real in-memory API middleware. Browser actions make real HTTP requests; the API is not mocked. This checks the integrated app, but not the standalone Node entry point or Nginx/Docker routing. Locally Playwright may reuse an existing server on that port. If `PLAYWRIGHT_BASE_URL` is set, it tests that running deployment without starting a server.

`npm run dev` runs both the frontend and API through Vite middleware. `npm run preview` also includes the API. `npm run up` builds Nginx and the Node API as separate containers; only Nginx is exposed on port 8080. To run just the standalone API on port 3001, run `npm run build:api` followed by `npm run start:api`.

| Endpoint                      | Body                           | Behavior                        |
| ----------------------------- | ------------------------------ | ------------------------------- |
| `POST /api/games`             | `{ "size": 3 }`                | Create a game (size 3, 4, or 5) |
| `GET /api/games/:id`          | —                              | Read current state              |
| `POST /api/games/:id/moves`   | `{ "index": 0, "version": 0 }` | Apply a legal move              |
| `POST /api/games/:id/restart` | `{ "version": 1 }`             | Reset the original board        |

Successful responses contain `{ id, size, board, moves, solved, version, legalMoves }`. Mutation versions prevent stale/repeated commands from being applied. The UI waits for each response and blocks further input on failure. Retry reads the current game first, because a failed response does not prove the move failed on the server. Requests time out after 10 seconds.

Deliberate demo shortcuts:

- **No authentication or authorization.** Anyone with a game ID can read or change it. Random IDs are not an ownership policy.
- **No database or resume on refresh.** Games live in a process-local Map; backend restarts lose everything, and page refresh creates a new game. Only one API instance is supported.
- **No expiration, storage limits, or rate limiting.** Abandoned games accumulate until restart. This is not ready for unrestricted public traffic.
- **No production security/operations layer:** no dedicated CSRF protection, TLS setup, audit log, or monitoring. Same-origin routing simplifies deployment but does not replace these controls.
- **No optimistic moves, offline play, or multiplayer synchronization.** Each move costs a network round trip. A missing game requires a page reload. Failed create requests can leave an unused game in memory.

Puzzle rules and their tests live in `server/domain/`. The public API types and supported sizes live in `server/contracts.ts`; the backend has no imports from the frontend. The browser uses server-provided legal move indexes instead of running puzzle rules. `server/api.ts` owns game state and HTTP handling; `client/services/puzzleApi.ts` and `usePuzzleGame` connect React to it. Unit/component tests use the in-memory API behind a fetch stub; API tests also exercise real HTTP, and Playwright exercises the Vite API integration.

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
