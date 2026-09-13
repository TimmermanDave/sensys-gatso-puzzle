import { usePuzzleContext } from '../../context/PuzzleContext';
import { Card } from '../generic/Card';
import { GameActions } from '../generic/GameActions';
import { GameToolbar } from '../generic/GameToolbar';
import { PuzzleBoard } from '../puzzle/PuzzleBoard';

export default function PuzzleGame() {
  const { board, size, solved, move } = usePuzzleContext();
  return (
    <Card aria-label="Sliding puzzle game">
      <GameToolbar />
      <PuzzleBoard board={board} size={size} onMove={move} solved={solved} />
      <GameActions />
    </Card>
  );
}
