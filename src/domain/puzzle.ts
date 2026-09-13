export const puzzleSizes = [3, 4, 5] as const;
export type PuzzleSize = (typeof puzzleSizes)[number];
export type Board = readonly number[];

export function createSolvedBoard(size: PuzzleSize): Board {
  return Array.from(
    { length: size * size },
    (_, index) => (index + 1) % (size * size),
  );
}

export function isSolved(board: Board): boolean {
  return board.every((tile, index) => tile === (index + 1) % board.length);
}

export function canMove(
  board: Board,
  size: PuzzleSize,
  index: number,
): boolean {
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= board.length ||
    board[index] === 0
  )
    return false;
  const empty = board.indexOf(0);
  const distance =
    Math.abs(Math.floor(index / size) - Math.floor(empty / size)) +
    Math.abs((index % size) - (empty % size));
  return distance === 1;
}

export function moveTile(board: Board, size: PuzzleSize, index: number): Board {
  if (!canMove(board, size, index)) return board;
  const next = [...board];
  const empty = board.indexOf(0);
  [next[empty], next[index]] = [next[index], next[empty]];
  return next;
}

// Mulberry32: a small deterministic PRNG. Randomness is an input to the domain.
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

// Legal moves from the solved board guarantee solvability for every size.
// Avoid immediately undoing a move. This is a random walk, not a uniform sample.
export function shuffleBoard(size: PuzzleSize, seed: number): Board {
  const random = seededRandom(seed);
  let board = createSolvedBoard(size);
  let previousEmpty = -1;
  for (let step = 0; step < size * size * 30; step++) {
    const choices = board
      .map((_, index) => index)
      .filter(
        (index) => index !== previousEmpty && canMove(board, size, index),
      );
    const index = choices[Math.floor(random() * choices.length)];
    previousEmpty = board.indexOf(0);
    board = moveTile(board, size, index);
  }
  // Never start with an already completed puzzle.
  if (isSolved(board)) board = moveTile(board, size, board.length - 2);
  return board;
}
