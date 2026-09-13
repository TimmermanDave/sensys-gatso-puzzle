import { usePuzzleContext } from '../../context/PuzzleContext';
import { Button } from './Button';

import styles from './GameActions.module.css';

export function GameActions() {
  const { newGame, restart } = usePuzzleContext();
  return (
    <div className={styles.actions}>
      <Button variant="primary" onClick={() => newGame()}>
        New puzzle
      </Button>
      <Button onClick={restart}>Restart</Button>
    </div>
  );
}
