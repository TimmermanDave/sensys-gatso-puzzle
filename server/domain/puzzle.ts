import type { Board, PuzzleSize } from '../contracts.js';

/**
 * Generates a solved board state based on the grid size.
 * Numbers count up from 1, and the empty tile (0) is at the very end.
 * Example for size 3 (3x3): [1, 2, 3, 4, 5, 6, 7, 8, 0]
 */
export function createSolvedBoard(size: PuzzleSize): Board {
  return Array.from(
    { length: size * size },
    // (index + 1) % total length ensures the last element wraps around to 0
    (_, index) => (index + 1) % (size * size),
  );
}

/**
 * Checks if the current board matches the solved state layout.
 */
export function isSolved(board: Board): boolean {
  return board.every((tile, index) => tile === (index + 1) % board.length);
}

/**
 * Validates if a tile at a specific index can legally slide into the empty space.
 * It must be directly adjacent (Up, Down, Left, Right) to the empty tile.
 * Uses Manhattan Distance calculation https://www.maartengrootendorst.com/blog/distances/:
 * Calculates the exact grid steps (no diagonals) legally required to reach the empty space.
 */
export function canMove(
  board: Board,
  size: PuzzleSize,
  index: number,
): boolean {
  // Boundary check: ensure index is a valid integer within the board and not the empty space itself
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= board.length ||
    board[index] === 0
  )
    return false;

  const empty = board.indexOf(0);

  // 1. Math.floor(index / size) gives the row index
  // 2. index % size gives the column index
  // Summing the vertical and horizontal differences gives the total distance
  const distance =
    Math.abs(Math.floor(index / size) - Math.floor(empty / size)) +
    Math.abs((index % size) - (empty % size));

  // A tile can only move if it is exactly 1 step away from the empty space
  return distance === 1;
}

/**
 * Swaps a chosen tile with the empty space if the move is legal.
 * Returns a new board array to keep data immutable.
 */
export function moveTile(board: Board, size: PuzzleSize, index: number): Board {
  if (!canMove(board, size, index)) return board;

  const next = [...board]; // Create a copy to avoid mutating the original board
  const empty = board.indexOf(0);

  // Swap the clicked tile and the empty tile positions
  [next[empty], next[index]] = [next[index], next[empty]];
  return next;
}

/**
 * Mulberry32 https://github.com/cprosche/mulberry32:
 * Passing the same seed value guarantees the exact same sequence of random numbers.
 */
function seededRandom(a: number): () => number {
  return () => {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Shuffles the puzzle by making a series of valid, random moves starting from the solved state.
 * This guarantees the resulting puzzle is actually solvable
 * (as purely random array shuffling can create unsolvable states).
 */
export function shuffleBoard(size: PuzzleSize, seed: number): Board {
  const random = seededRandom(seed);
  let board = createSolvedBoard(size);
  let previousEmpty = -1;

  // Scale the shuffle steps based on grid size (e.g., 270 steps for 3x3)
  for (let step = 0; step < size * size * 30; step++) {
    // Gather all valid tile indexes that can move, excluding the one we just moved out of
    const choices = board
      .map((_, index) => index)
      .filter(
        (index) => index !== previousEmpty && canMove(board, size, index),
      );

    // Pick a random valid tile and execute the slide
    const index = choices[Math.floor(random() * choices.length)];
    previousEmpty = board.indexOf(0); // Track previous location to prevent immediate back-and-forth undoing
    board = moveTile(board, size, index);
  }

  // Edge case: If the shuffle randomly loops back into a perfect solved layout,
  // break it by force-moving one of the last tiles.
  if (isSolved(board)) board = moveTile(board, size, board.length - 2);

  return board;
}
