import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { PuzzleBoard } from '../puzzle/PuzzleBoard';

it('renders tiles, accepts adjacent clicks, and ignores illegal clicks', async () => {
  const onMove = vi.fn();
  render(
    <PuzzleBoard
      board={[1, 2, 3, 4, 5, 6, 7, 0, 8]}
      size={3}
      onMove={onMove}
      solved={false}
    />,
  );
  const user = userEvent.setup();
  expect(screen.getAllByRole('button')).toHaveLength(8);
  await user.click(screen.getByRole('button', { name: 'Tile 1' }));
  expect(onMove).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Tile 8' }));
  expect(onMove).toHaveBeenCalledWith(8);
});

it('supports arrow keys and prevents moves after completion', async () => {
  const onMove = vi.fn();
  const { rerender } = render(
    <PuzzleBoard
      board={[1, 2, 3, 4, 5, 6, 7, 0, 8]}
      size={3}
      onMove={onMove}
      solved={false}
    />,
  );
  const user = userEvent.setup();
  screen.getByRole('button', { name: 'Tile 8' }).focus();
  await user.keyboard('{ArrowLeft}');
  expect(onMove).toHaveBeenCalledExactlyOnceWith(8);
  onMove.mockClear();
  rerender(
    <PuzzleBoard
      board={[1, 2, 3, 4, 5, 6, 7, 8, 0]}
      size={3}
      onMove={onMove}
      solved
    />,
  );
  await user.keyboard('{ArrowRight}');
  await user.click(screen.getByRole('button', { name: 'Tile 8' }));
  expect(onMove).not.toHaveBeenCalled();
});
