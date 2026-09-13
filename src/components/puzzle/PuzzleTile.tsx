import type { CSSProperties } from 'react';
import styles from './PuzzleTile.module.css';

type Props = {
  value: number;
  row: number;
  column: number;
  movable: boolean;
  onMove: () => void;
};

export function PuzzleTile({ value, row, column, movable, onMove }: Props) {
  return (
    <button
      className={styles.tile}
      type="button"
      style={{ '--row': row, '--column': column } as CSSProperties}
      aria-label={`Tile ${value}`}
      aria-disabled={!movable}
      onClick={() => {
        if (movable) onMove();
      }}
    >
      {value}
    </button>
  );
}
