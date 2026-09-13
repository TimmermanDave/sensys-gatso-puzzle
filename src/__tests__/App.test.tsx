import boardStyles from '../components/puzzle/PuzzleBoard.module.css';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { App } from '../App';
import * as puzzle from '../domain/puzzle';

it('counts moves, restarts the same board, and changes size with a fresh counter', async () => {
  const user = userEvent.setup();
  render(<App initialSeed={42} />);
  await screen.findByRole('group', { name: '3 by 3 puzzle' });
  const startingPositions = screen
    .getAllByRole('button', { name: /^Tile / })
    .map((tile) => ({
      value: tile.textContent,
      position: tile.getAttribute('style'),
    }));
  const movable = screen
    .getAllByRole('button', { name: /^Tile / })
    .find((tile) => tile.getAttribute('aria-disabled') === 'false')!;
  await user.click(movable);
  expect(screen.getByLabelText('Moves')).toHaveTextContent('1');
  await user.click(screen.getByRole('button', { name: 'Restart' }));
  expect(screen.getByLabelText('Moves')).toHaveTextContent('0');
  expect(
    screen.getAllByRole('button', { name: /^Tile / }).map((tile) => ({
      value: tile.textContent,
      position: tile.getAttribute('style'),
    })),
  ).toEqual(startingPositions);
  await user.click(screen.getByRole('radio', { name: '4 × 4' }));
  expect(screen.getByRole('group', { name: '4 by 4 puzzle' })).toBeVisible();
  expect(screen.getAllByRole('button', { name: /^Tile / })).toHaveLength(15);
  await user.click(screen.getByRole('radio', { name: '5 × 5' }));
  expect(screen.getAllByRole('button', { name: /^Tile / })).toHaveLength(24);
  await user.click(screen.getByRole('button', { name: 'New puzzle' }));
  expect(screen.getByLabelText('Moves')).toHaveTextContent('0');
});

it('marks the board solved after the final move and prevents further moves', async () => {
  const shuffle = vi
    .spyOn(puzzle, 'shuffleBoard')
    .mockReturnValue([1, 2, 3, 4, 5, 6, 7, 0, 8]);
  const user = userEvent.setup();
  render(<App initialSeed={42} />);
  await screen.findByRole('group', { name: '3 by 3 puzzle' });
  shuffle.mockRestore();
  await user.click(screen.getByRole('button', { name: 'Tile 8' }));
  expect(screen.getByRole('group', { name: '3 by 3 puzzle' })).toHaveClass(
    boardStyles.solved,
  );
  expect(screen.getByLabelText('Moves')).toHaveTextContent(/^1$/);
  expect(
    screen
      .getAllByRole('button', { name: /^Tile / })
      .every((tile) => tile.getAttribute('aria-disabled') === 'true'),
  ).toBe(true);
  await user.click(screen.getByRole('button', { name: 'Tile 8' }));
  await user.keyboard('{ArrowRight}');
  expect(screen.getByLabelText('Moves')).toHaveTextContent(/^1$/);
  expect(screen.getByRole('group', { name: '3 by 3 puzzle' })).toHaveClass(
    boardStyles.solved,
  );
});
