import { createContext, useContext, type ReactNode } from 'react';
import {
  usePuzzleGame,
  type PuzzleGameState, // Clean, explicit type imported directly
} from '../hooks/usePuzzleGame';

// Initialize context cleanly using the explicit state type
const PuzzleContext = createContext<PuzzleGameState | null>(null);

export function PuzzleProvider({ children }: { children: ReactNode }) {
  const game = usePuzzleGame();
  return (
    <PuzzleContext.Provider value={game}>
      {game.error && (
        <p role="alert">
          {game.error}{' '}
          <button disabled={game.pending} onClick={game.retry}>
            Retry
          </button>
        </p>
      )}
      {!game.ready && game.pending && <p role="status">Loading puzzle…</p>}
      {game.ready && children}
    </PuzzleContext.Provider>
  );
}

export function usePuzzleContext() {
  const game = useContext(PuzzleContext);
  if (!game) {
    throw new Error('usePuzzleContext must be used within a PuzzleProvider');
  }
  return game;
}
