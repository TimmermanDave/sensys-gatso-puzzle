import PuzzleGame from './components/puzzle/PuzzleGame';
import { PuzzleProvider } from './context/PuzzleContext';
import { GameBoundary } from './bounderies/GameBoundary';
import { Logo } from './components/generic/Logo';

import styles from './App.module.css';

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
      {import.meta.env.DEV && (
        <nav className={styles.reports} aria-label="Development reports">
          <span>Reports</span>
          <a href="/reports/vitest/index.html" target="_blank" rel="noreferrer">
            Unit tests
          </a>
          <a
            href="/reports/playwright/html/index.html"
            target="_blank"
            rel="noreferrer"
          >
            Browser tests
          </a>
          <a
            href="/reports/lighthouse/index.html"
            target="_blank"
            rel="noreferrer"
          >
            Lighthouse
          </a>
        </nav>
      )}
    </main>
  );
}
