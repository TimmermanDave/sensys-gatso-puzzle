import { createContext, useContext, type ReactNode } from 'react';
import { usePuzzleGame, type PuzzleGameOptions } from '../hooks/usePuzzleGame';

const PuzzleContext = createContext<ReturnType<typeof usePuzzleGame> | null>(
  null,
);

export function PuzzleProvider({
  children,
  ...options
}: PuzzleGameOptions & { children: ReactNode }) {
  const game = usePuzzleGame(options);
  return (
    <PuzzleContext.Provider value={game}>{children}</PuzzleContext.Provider>
  );
}

export function usePuzzleContext() {
  const game = useContext(PuzzleContext);
  if (!game)
    throw new Error('usePuzzleContext must be used within a PuzzleProvider');
  return game;
}
