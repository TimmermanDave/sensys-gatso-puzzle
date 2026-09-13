import type { CSSProperties, KeyboardEvent } from 'react';
import type { Board, PuzzleSize } from '../../../server/contracts';
import { PuzzleTile } from './PuzzleTile';

import styles from './PuzzleBoard.module.css';

type Props = {
  board: Board;
  legalMoves: readonly number[];
  size: PuzzleSize;
  onMove: (index: number) => void;
  solved: boolean;
  disabled?: boolean;
};

export function PuzzleBoard({
  board,
  legalMoves,
  size,
  onMove,
  solved,
  disabled = false,
}: Props) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const empty = board.indexOf(0);
    // Arrow keys describe the direction the numbered tile travels.
    const offsets: Record<string, number> = {
      ArrowUp: size,
      ArrowDown: -size,
      ArrowLeft: 1,
      ArrowRight: -1,
    };
    const offset = offsets[event.key];
    if (offset === undefined) return;
    event.preventDefault();
    const index = empty + offset;
    if (!disabled && !solved && legalMoves.includes(index)) onMove(index);
  }

  return (
    <div
      className={`${styles.board} ${solved ? styles.solved : ''}`}
      style={{ '--size': size } as CSSProperties}
      role="group"
      aria-label={`${size} by ${size} puzzle`}
      aria-describedby="puzzle-help"
      onKeyDown={handleKeyDown}
    >
      {/* Stable DOM order keeps moves from interrupting CSS transitions. */}
      {Array.from({ length: size * size - 1 }, (_, offset) => {
        const tile = offset + 1;
        const index = board.indexOf(tile);
        return (
          <PuzzleTile
            key={tile}
            value={tile}
            row={Math.floor(index / size)}
            column={index % size}
            movable={!disabled && !solved && legalMoves.includes(index)}
            onMove={() => onMove(index)}
          />
        );
      })}
    </div>
  );
}
