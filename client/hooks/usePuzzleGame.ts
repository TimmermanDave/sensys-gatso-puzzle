import { useEffect, useRef, useState } from 'react';
import { puzzleRequest } from '../services/puzzleApi';
import type {
  GameSnapshot,
  GameRequest,
  PuzzleSize,
} from '../../server/contracts';

export function usePuzzleGame() {
  const [game, setGame] = useState<GameSnapshot | null>(null);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const initial = useRef<Promise<GameSnapshot> | null>(null);

  useEffect(() => {
    let active = true;
    // Reuse the request when StrictMode replays the effect.
    initial.current ??= puzzleRequest('', { size: 3 });
    initial.current
      .then(
        (state) => {
          if (active) setGame(state);
        },
        (reason) => {
          if (active) setError(String(reason.message ?? reason));
        },
      )
      .finally(() => {
        if (active) setPending(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function request(path: string, body?: GameRequest) {
    if (busy.current || pending) return;
    busy.current = true;
    setPending(true);
    setError(null);
    try {
      setGame(await puzzleRequest(path, body));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Request failed.');
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  return {
    board: game?.board ?? [],
    legalMoves: game?.legalMoves ?? [],
    size: game?.size ?? 3,
    moves: game?.moves ?? 0,
    solved: game?.solved ?? false,
    ready: game !== null,
    pending,
    error,
    move: (index: number) => {
      if (game && !error && !game.solved && game.legalMoves.includes(index))
        void request(`/${game.id}/moves`, { index, version: game.version });
    },
    newGame: (size: PuzzleSize = game?.size ?? 3) => {
      if (!error) void request('', { size });
    },
    restart: () => {
      if (game && !error)
        void request(`/${game.id}/restart`, { version: game.version });
    },
    // A failed mutation may have reached the server: read before allowing more moves.
    retry: () =>
      void request(game ? `/${game.id}` : '', game ? undefined : { size: 3 }),
  };
}

export type PuzzleGameState = ReturnType<typeof usePuzzleGame>;
