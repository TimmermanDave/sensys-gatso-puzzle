# Slide

A small React + TypeScript sliding puzzle. Order the numbered tiles from left to right, top to bottom, with the empty space last.

## Run locally

Requires Node.js 22+ and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. The game starts with a shuffled, solvable 3×3 board. Choose 4×4 or 5×5 for a larger puzzle. Click an adjacent tile, or focus a tile and use arrow keys (the arrow is the direction the numbered tile moves). Restart restores the current starting board; New puzzle generates a new seed. Changing size starts a new game. Completing the board stops further moves.

## Structure

- `src/domain/puzzle.ts`: pure board rules and deterministic seeded shuffling; no React, browser APIs, or mutation of input boards.
- `src/App.tsx`: page shell, game provider, and lazy game composition.
- `src/hooks/usePuzzleGame.ts`: game state and actions; accepts a seed generator for deterministic hook tests.
- `src/context/PuzzleContext.tsx`: one game-scoped provider and a guarded consumer hook. Each provider owns an independent game.
- `src/components/`: controlled board and size picker components.
- `src/theme.css`: shared design tokens, base element styles, and reduced-motion preference.
- `src/App.module.css` and `src/components/*.module.css`: locally scoped layout and component styles, including responsive rules. Components import their own styles and use the shared theme tokens.
- `src/domain/__tests__/puzzle.test.ts`: move rules, immutability, determinism, and independent solvability checks.
- `src/components/__tests__/PuzzleBoard.test.tsx` and `src/__tests__/App.test.tsx`: interactions, keyboard controls, and game state integration.
- `e2e/__tests__/puzzle.spec.ts`: browser coverage of the main play flow at mobile width.

State stays local to the game provider; no backend, global state library, persistence, or routing is needed for this MVP. Domain functions expect a valid board of the specified size, containing every number from zero to size²−1 exactly once. Zero represents the empty space. Illegal move indices safely return the existing board.

`PuzzleGame` connects context to the prop-driven board and size picker. A single context is sufficient for this small game; all consumers update when the game changes. The state hook can also be used without context.

`GameToolbar` and `GameActions` own their layout and context connections. Shared `Button` and `Card` components keep game and boundary styling consistent while forwarding standard HTML props. `PuzzleBoard` owns grid layout and keyboard handling; the prop-driven `PuzzleTile` owns its button, positioning, and animation styles. The logo and size picker each own their CSS module.

`GameBoundary` composes a reusable `ErrorBoundary` with React Suspense around the lazy game panel. Loading and render/import failures have separate fallbacks, with the page shell remaining visible. Recovery reloads the page to retry a failed module download and starts a fresh game. Error boundaries do not catch event-handler errors or arbitrary background promises. Gameplay is synchronous and needs no async state abstraction. Hook, provider isolation, loading, and error behavior have focused tests.

## Shuffle design

`shuffleBoard(size, seed)` always returns the same board for the same inputs. It uses a seeded PRNG to choose legal moves from the solved board, avoiding immediate reversals, and ensures the result is not already solved. Every generated board therefore has a path back to the solution. The random walk is not a uniform sample of all solvable boards and does not guarantee a particular difficulty or minimum solution length.

## Test scope

Tests live in local `__tests__` folders alongside each layer; shared setup is in `src/__tests__/setup.ts`.

| Layer             | Focus                                                                                                                                              |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Domain            | Legal adjacency, row boundaries, immutable moves, seeded reproducibility, and independent solvability parity across all sizes and 100 seeds each.  |
| Hooks and context | Move counts, deterministic new games, restart, completed-game locking, provider sharing/isolation, and missing-provider errors.                    |
| Components        | Tile pointer/Enter/Space activation, board arrow keys, illegal-move guards, and loading/render/import failure fallbacks.                           |
| App integration   | Size controls, restart, new-game counter, and final-move locking through the composed UI.                                                          |
| Browser           | One reproducible Chromium smoke flow at mobile width: play, ignore illegal clicks, restart, all sizes, new-game reset, and no horizontal overflow. |

This keeps the original MVP testing scope: meaningful logic and interaction checks plus a small E2E suite. Presentational wrappers and the logo are exercised through the app rather than receiving markup snapshots. The suite does not claim cross-browser coverage, visual regression coverage, or a complete accessibility audit. Full puzzle completion is covered in integration tests rather than by solving a random board in E2E.

## Checks

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

`npm run check` runs the build, unit/component tests, and browser tests. Browser tests start their own Vite server. `npm run test:watch` starts interactive unit/component testing. To serve the production bundle locally, run `npm run build` followed by `npm run preview`.

Every completed `npm test` run creates or updates `reports/vitest/index.html`; `npm run test:e2e` creates or updates `reports/playwright/index.html`, including failing test results. Playwright traces and other test artifacts live in `reports/playwright-results/`. Coverage output, when enabled, goes to `reports/coverage/`. Terminal output stays enabled; report generation exits when tests finish and never opens a browser or report server.

```sh
npm run test:report       # Run unit/component tests and update their report
npm run test:e2e:report   # Run browser tests and update their report
```

These are aliases for `npm test` and `npm run test:e2e`. `npm run check` builds the app and runs both suites, updating both reports without starting report viewers. The `reports/` folder is excluded from Git, formatting, and the Docker build context. Keep any manually generated Lighthouse reports under `reports/lighthouse/` too.

To test a running container, set `PLAYWRIGHT_BASE_URL=http://127.0.0.1:8080` before running `npm run test:e2e` (PowerShell: `$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:8080'`). With this variable set, Playwright uses the existing server.

## Docker

With Docker running:

```sh
docker compose up --build -d
```

Open http://localhost:8080. Stop with `docker compose down`.

The multi-stage build ships only static assets and unprivileged Nginx; Node and development dependencies stay in the build stage. The runtime uses UID/GID 101, port 8080, a health check, and browser security headers. Compose makes the root filesystem read-only, mounts temporary storage at `/tmp`, drops Linux capabilities, and prevents privilege escalation. Inline styles are allowed by CSP for tile coordinates. Image tags track upstream updates; pin reviewed image digests if deploying to production.
