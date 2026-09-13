import { usePuzzleContext } from '../../context/PuzzleContext';
import { Button } from './Button';

import styles from './GameActions.module.css';

export function GameActions() {
  const { newGame, restart, pending, error } = usePuzzleContext();
  return (
    <div className={styles.actions}>
      <Button
        disabled={pending || !!error}
        variant="primary"
        onClick={() => newGame()}
      >
        New puzzle
      </Button>
      <Button disabled={pending || !!error} onClick={restart}>
        Restart
      </Button>
    </div>
  );
}
