import { useState } from 'react';
import {
  isSolved,
  moveTile,
  shuffleBoard,
  type PuzzleSize,
} from '../domain/puzzle';

function randomSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0];
}

function createGame(size: PuzzleSize, seed: number) {
  return { size, seed, board: shuffleBoard(size, seed), moves: 0 };
}

export type PuzzleGameOptions = {
  initialSeed?: number;
  getSeed?: () => number;
};

export function usePuzzleGame({
  initialSeed,
  getSeed = randomSeed,
}: PuzzleGameOptions = {}) {
  const [game, setGame] = useState(() =>
    createGame(3, initialSeed ?? getSeed()),
  );
  function move(index: number) {
    setGame((current) => {
      if (isSolved(current.board)) return current;
      const board = moveTile(current.board, current.size, index);
      return board === current.board
        ? current
        : { ...current, board, moves: current.moves + 1 };
    });
  }
  function newGame(size?: PuzzleSize) {
    // Generate randomness outside the updater so React can safely replay it.
    const seed = getSeed();
    setGame((current) => createGame(size ?? current.size, seed));
  }
  function restart() {
    setGame((current) => createGame(current.size, current.seed));
  }
  return { ...game, solved: isSolved(game.board), move, newGame, restart };
}
