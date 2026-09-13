import { randomBytes, randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { canMove, isSolved, moveTile, shuffleBoard } from './domain/puzzle.js';
import {
  puzzleSizes,
  type PuzzleSize,
  type GameSnapshot,
  type ApiResponse,
} from './contracts.js';

type StoredGame = Omit<GameSnapshot, 'legalMoves'> & { seed: number };

const MAX_BODY_BYTES = 1024;
const GAME_ROUTE = /^\/api\/games\/([^/]+)(?:\/(moves|restart))?$/;

function isPuzzleSize(value: unknown): value is PuzzleSize {
  return puzzleSizes.some((size) => size === value);
}

function errorResponse(status: number, error: string): ApiResponse {
  return { status, data: { error } };
}

function gameResponse(game: StoredGame): ApiResponse {
  // The seed stays on the server so restart can reproduce the original board.
  const { seed: _seed, ...snapshot } = game;
  const legalMoves = game.solved
    ? []
    : game.board
        .map((_, index) => index)
        .filter((index) => canMove(game.board, game.size, index));
  return { status: 200, data: { ...snapshot, legalMoves } };
}

function sendJson(res: ServerResponse, { status, data }: ApiResponse): void {
  res.writeHead(status).end(JSON.stringify(data));
}

// Each API instance owns its games. Demo only: no auth, persistence, or eviction.
export function createGameApi() {
  const games = new Map<string, StoredGame>();

  return function dispatch(
    method: string,
    path: string,
    body: Record<string, unknown> = {},
  ): ApiResponse {
    if (method === 'POST' && path === '/api/games') {
      const { size } = body;
      if (!isPuzzleSize(size)) {
        return errorResponse(400, 'Size must be 3, 4, or 5.');
      }

      const seed = randomBytes(4).readUInt32LE();
      const game: StoredGame = {
        id: randomUUID(),
        size,
        seed,
        board: shuffleBoard(size, seed),
        moves: 0,
        solved: false,
        version: 0,
      };
      games.set(game.id, game);
      return gameResponse(game);
    }

    const [, gameId, action] = GAME_ROUTE.exec(path) ?? [];
    const game = games.get(gameId);
    if (!game) {
      return errorResponse(404, 'Game not found. Reload to start a new game.');
    }
    if (method === 'GET' && !action) {
      return gameResponse(game);
    }
    if (method !== 'POST' || !action) {
      return errorResponse(405, 'Method not allowed.');
    }

    // Reject stale or repeated commands before changing any state.
    if (body.version !== game.version) {
      return errorResponse(
        409,
        'Game changed. Retry to reload its current state.',
      );
    }

    if (action === 'restart') {
      game.board = shuffleBoard(game.size, game.seed);
      game.moves = 0;
    } else {
      const { index } = body;
      if (
        game.solved ||
        typeof index !== 'number' ||
        !canMove(game.board, game.size, index)
      ) {
        return errorResponse(400, 'Illegal move.');
      }
      game.board = moveTile(game.board, game.size, index);
      game.moves++;
    }

    game.solved = isSolved(game.board);
    game.version++;
    return gameResponse(game);
  };
}

export function createApiHandler() {
  const dispatch = createGameApi();

  return async (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');

    try {
      let raw = '';
      for await (const chunk of req) {
        raw += chunk;
        if (Buffer.byteLength(raw) > MAX_BODY_BYTES) {
          sendJson(res, errorResponse(413, 'Request too large.'));
          return;
        }
      }

      const body: unknown = raw ? JSON.parse(raw) : {};
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw new SyntaxError('Request body must be a JSON object.');
      }

      const path = (req.url ?? '').split('?')[0];
      const response = dispatch(
        req.method ?? '',
        path,
        body as Record<string, unknown>,
      );
      sendJson(res, response);
    } catch (error) {
      const status = error instanceof SyntaxError ? 400 : 500;
      sendJson(res, errorResponse(status, 'Could not process request.'));
    }
  };
}
