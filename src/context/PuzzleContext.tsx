import { createContext, useContext, type ReactNode } from 'react';
import { 
  usePuzzleGame, 
  type PuzzleGameOptions, 
  type PuzzleGameState // Clean, explicit type imported directly
} from '../hooks/usePuzzleGame';

// Initialize context cleanly using the explicit state type
const PuzzleContext = createContext<PuzzleGameState | null>(null);

export function PuzzleProvider({ children, ...options }: PuzzleGameOptions & { children: ReactNode }) {
  const game = usePuzzleGame(options);
  return (
    <PuzzleContext.Provider value={game}>{children}</PuzzleContext.Provider>
  );
}

export function usePuzzleContext() {
  const game = useContext(PuzzleContext);
  if (!game) {
    throw new Error('usePuzzleContext must be used within a PuzzleProvider');
  }
  return game;
}
