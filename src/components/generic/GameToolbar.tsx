import { usePuzzleContext } from '../../context/PuzzleContext';
import { SizePicker } from './SizePicker';
import styles from './GameToolbar.module.css';

export function GameToolbar() {
  const { size, moves, newGame } = usePuzzleContext();
  return (
    <div className={styles.toolbar}>
      <SizePicker size={size} onChange={newGame} />
      <div className={styles.counter}>
        <span>Moves</span>
        <output aria-label="Moves">{moves}</output>
      </div>
    </div>
  );
}
