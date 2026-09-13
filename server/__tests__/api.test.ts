import { createServer, request } from 'node:http';
import { afterEach, expect, it } from 'vitest';
import { createApiHandler, createGameApi } from '../api';
import { canMove } from '../domain/puzzle';
import type { GameSnapshot } from '../contracts';

it('validates setup and moves, rejects stale commands, and restores the initial board', () => {
  const api = createGameApi();
  expect(api('POST', '/api/games', { size: 6 }).status).toBe(400);
  expect(api('GET', '/api/games/missing').status).toBe(404);
  const initial = api('POST', '/api/games', { size: 3 }).data as GameSnapshot;
  expect(initial.legalMoves).toEqual(
    initial.board
      .map((_, index) => index)
      .filter((index) => canMove(initial.board, 3, index)),
  );
  const path = `/api/games/${initial.id}`;
  expect(
    api('POST', `${path}/moves`, {
      index: initial.board.indexOf(0),
      version: 0,
    }).status,
  ).toBe(400);
  const index = initial.board.findIndex((_, i) => canMove(initial.board, 3, i));
  const moved = api('POST', `${path}/moves`, { index, version: 0 });
  expect(moved.data).toMatchObject({ moves: 1, version: 1 });
  const current = moved.data as GameSnapshot;
  expect(current.legalMoves).toEqual(
    current.board
      .map((_, index) => index)
      .filter((index) => canMove(current.board, 3, index)),
  );
  expect(api('POST', `${path}/moves`, { index, version: 0 }).status).toBe(409);
  expect(api('POST', `${path}/restart`, { version: 0 }).status).toBe(409);
  expect(api('POST', `${path}/restart`, { version: 1 }).data).toMatchObject({
    board: initial.board,
    moves: 0,
    version: 2,
  });
  expect(api('GET', path).data).not.toHaveProperty('seed');
});

const server = createServer(createApiHandler());
afterEach(async () => {
  if (server.listening)
    await new Promise<void>((resolve) => server.close(() => resolve()));
});

it('serves JSON over HTTP and rejects malformed and oversized bodies', async () => {
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as { port: number };
  const post = (body: string) =>
    new Promise<{ status: number; body: GameSnapshot }>((resolve, reject) => {
      const req = request(
        {
          host: '127.0.0.1',
          port: address.port,
          path: '/api/games',
          method: 'POST',
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () =>
            resolve({ status: res.statusCode!, body: JSON.parse(data) }),
          );
        },
      );
      req.on('error', reject);
      req.end(body);
    });
  const created = await post('{"size":4}');
  expect(created.status).toBe(200);
  expect(created.body.board).toHaveLength(16);
  expect((await post('{')).status).toBe(400);
  expect((await post('null')).status).toBe(400);
  expect((await post('x'.repeat(1025))).status).toBe(413);
});
