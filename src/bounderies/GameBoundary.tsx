import { Suspense, type ReactNode } from 'react';
import { ErrorBoundary } from '../bounderies/ErrorBoundary';
import { Button } from '../components/generic/Button';
import { Card } from '../components/generic/Card';

export function GameBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <Card role="alert">
          <h2>The puzzle couldn’t open.</h2>
          <p>Please reload to start a fresh game.</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Reload game
          </Button>
        </Card>
      }
    >
      <Suspense fallback={<Card role="status">Loading puzzle…</Card>}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}
