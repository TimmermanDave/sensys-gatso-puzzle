import PuzzleGame from './components/puzzle/PuzzleGame';
import { PuzzleProvider } from './context/PuzzleContext';
import { GameBoundary } from './bounderies/GameBoundary';
import { Logo } from './components/generic/Logo';
import { GameTestLinks } from './components/generic/GameTestLinks';

import styles from './App.module.css';

export function App() {
  return (
    <main className={styles.app}>
      <header className={styles.heading}>
        <Logo />
      </header>
      <GameBoundary>
        <PuzzleProvider>
          <PuzzleGame />
        </PuzzleProvider>
      </GameBoundary>
      {import.meta.env.DEV && <GameTestLinks />}
    </main>
  );
}
