import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { ErrorBoundary } from '../../bounderies/ErrorBoundary';
import { canMove } from '../../domain/puzzle';
import { PuzzleProvider, usePuzzleContext } from '../PuzzleContext';

function Consumer({ name }: { name: string }) {
  const { board, size, moves, move } = usePuzzleContext();
  return (
    <button
      onClick={() =>
        move(board.findIndex((_, index) => canMove(board, size, index)))
      }
    >
      {name}: {moves}
    </button>
  );
}

it('shares state within a provider and isolates separate providers', async () => {
  render(
    <>
      <PuzzleProvider initialSeed={42}>
        <Consumer name="First" />
        <Consumer name="Shared" />
      </PuzzleProvider>
      <PuzzleProvider initialSeed={42}>
        <Consumer name="Independent" />
      </PuzzleProvider>
    </>,
  );
  await userEvent
    .setup()
    .click(screen.getByRole('button', { name: 'First: 0' }));
  expect(screen.getByRole('button', { name: 'Shared: 1' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Independent: 0' })).toBeVisible();
});

it('reports a missing provider through the enclosing error boundary', () => {
  const errors: unknown[] = [];
  render(
    <ErrorBoundary fallback={<p>Missing provider</p>}>
      <Consumer name="Orphan" />
    </ErrorBoundary>,
    {
      onCaughtError: (error) => errors.push(error),
    },
  );
  expect(screen.getByText('Missing provider')).toBeVisible();
  expect(errors[0]).toEqual(
    new Error('usePuzzleContext must be used within a PuzzleProvider'),
  );
});
