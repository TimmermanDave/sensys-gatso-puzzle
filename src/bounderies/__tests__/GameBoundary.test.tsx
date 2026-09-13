import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it } from 'vitest';
import { GameBoundary } from '../GameBoundary';

it('renders the game content', () => {
  render(
    <GameBoundary>
      <p>Ready to play</p>
    </GameBoundary>,
  );
  expect(screen.getByText('Ready to play')).toBeVisible();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('shows recovery UI when the game fails to render', () => {
  function Child(): never {
    throw new Error('Render failed');
  }
  render(
    <GameBoundary>
      <Child />
    </GameBoundary>,
    { onCaughtError: () => {} },
  );
  expect(screen.getByRole('alert')).toHaveTextContent(
    'The puzzle couldn’t open.',
  );
  expect(screen.getByRole('button', { name: 'Reload game' })).toBeVisible();
});

it('replaces a game that fails on an update while preserving content outside the boundary', async () => {
  const user = userEvent.setup();
  function Game() {
    const [failed, setFailed] = useState(false);
    if (failed) throw new Error('Render failed after an update');
    return <button onClick={() => setFailed(true)}>Make a move</button>;
  }
  render(
    <>
      <h1>Puzzle</h1>
      <GameBoundary>
        <Game />
      </GameBoundary>
    </>,
    { onCaughtError: () => {} },
  );
  await user.click(screen.getByRole('button', { name: 'Make a move' }));

  expect(screen.getByRole('heading', { name: 'Puzzle' })).toBeVisible();
  expect(screen.getByRole('alert')).toBeVisible();
  expect(
    screen.queryByRole('button', { name: 'Make a move' }),
  ).not.toBeInTheDocument();
});
