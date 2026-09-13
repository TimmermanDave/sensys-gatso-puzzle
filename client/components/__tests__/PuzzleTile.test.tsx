import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { PuzzleTile } from '../puzzle/PuzzleTile';

it.each([true, false])(
  'handles pointer and keyboard activation when movable is %s',
  async (movable) => {
    const onMove = vi.fn();
    const user = userEvent.setup();
    render(
      <PuzzleTile
        value={8}
        row={2}
        column={1}
        movable={movable}
        onMove={onMove}
      />,
    );
    const tile = screen.getByRole('button', { name: 'Tile 8' });
    expect(tile).toHaveTextContent('8');
    expect(tile).toHaveAttribute('aria-disabled', String(!movable));
    await user.click(tile);
    expect(tile).toHaveFocus();
    await user.keyboard('{Enter} ');
    expect(onMove).toHaveBeenCalledTimes(movable ? 3 : 0);
  },
);
