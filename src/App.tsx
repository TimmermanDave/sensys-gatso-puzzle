import styles from './App.module.css';
import { lazy } from 'react';
import { PuzzleProvider } from './context/PuzzleContext';
import { GameBoundary } from './bounderies/GameBoundary';
import { Logo } from './components/generic/Logo';

const PuzzleGame = lazy(() => import('./components/puzzle/PuzzleGame'));

export function App({ initialSeed }: { initialSeed?: number }) {
  return (
    <main className={styles.app}>
      <header className={styles.heading}>
        <Logo />
      </header>
      <GameBoundary>
        <PuzzleProvider initialSeed={initialSeed}>
          <PuzzleGame />
        </PuzzleProvider>
      </GameBoundary>
    </main>
  );
}
