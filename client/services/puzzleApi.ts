import type { GameSnapshot, GameRequest } from '../../server/contracts';

export async function puzzleRequest(
  path: string,
  body?: GameRequest,
): Promise<GameSnapshot> {
  const response = await fetch(`/api/games${path}`, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? 'Request failed.');
  return data;
}
