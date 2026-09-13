import { puzzleSizes, type PuzzleSize } from '../../../server/contracts';

import styles from './SizePicker.module.css';

type Props = {
  size: PuzzleSize;
  onChange: (size: PuzzleSize) => void;
  disabled?: boolean;
};

export function SizePicker({ size, onChange, disabled }: Props) {
  return (
    <fieldset className={styles.picker} disabled={disabled}>
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
