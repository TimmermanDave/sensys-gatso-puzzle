import { puzzleSizes, type PuzzleSize } from '../../domain/puzzle';

import styles from './SizePicker.module.css';

type Props = { size: PuzzleSize; onChange: (size: PuzzleSize) => void };

export function SizePicker({ size, onChange }: Props) {
  return (
    <fieldset className={styles.picker}>
      <legend>Board size</legend>
      <div className={styles.options}>
        {puzzleSizes.map((option) => (
          <label key={option}>
            <input
              type="radio"
              name="size"
              value={option}
              checked={size === option}
              onChange={() => onChange(option)}
            />
            <span>
              {option} × {option}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
