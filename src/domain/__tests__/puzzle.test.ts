import { describe, expect, it } from 'vitest';
import {
  canMove,
  createSolvedBoard,
  isSolved,
  moveTile,
  puzzleSizes,
  shuffleBoard,
} from '../puzzle';

describe('puzzle rules', () => {
  it.each(puzzleSizes)('creates a solved board of size %i', (size) => {
    const board = createSolvedBoard(size);
    expect(board).toHaveLength(size * size);
    expect(board.at(-1)).toBe(0);
    expect(isSolved(board)).toBe(true);
  });

  it('only allows orthogonally adjacent tiles, without wrapping rows', () => {
    const board = [1, 2, 0, 3, 4, 5, 6, 7, 8];
    expect(canMove(board, 3, 1)).toBe(true);
    expect(canMove(board, 3, 5)).toBe(true);
    for (const index of [-1, 0, 2, 3, 4, 9, 1.5])
      expect(canMove(board, 3, index)).toBe(false);
  });

  it('slides immutably and ignores illegal moves', () => {
    const board = Object.freeze([1, 2, 3, 4, 5, 6, 7, 0, 8]);
    expect(moveTile(board, 3, 0)).toBe(board);
    const moved = moveTile(board, 3, 8);
    expect(moved).toEqual(createSolvedBoard(3));
    expect(board[7]).toBe(0);
    expect(isSolved(board)).toBe(false);
  });
});

describe('seeded shuffle', () => {
  it('is reproducible and varies with the seed', () => {
    expect(shuffleBoard(3, 123)).toEqual(shuffleBoard(3, 123));
    expect(shuffleBoard(3, 123)).not.toEqual(shuffleBoard(3, 456));
  });

  it.each(puzzleSizes)(
    'keeps boards of size %i valid, unsolved, and solvable across 100 seeds',
    (size) => {
      for (let seed = 0; seed < 100; seed++) {
        const board = shuffleBoard(size, seed);
        expect([...board].sort((a, b) => a - b)).toEqual(
          Array.from({ length: size * size }, (_, i) => i),
        );
        expect(isSolved(board)).toBe(false);
        // Independently verify solvability using inversion parity, not the shuffle algorithm.
        const tiles = board.filter((tile) => tile !== 0);
        let inversions = 0;
        for (let i = 0; i < tiles.length; i++) {
          for (let j = i + 1; j < tiles.length; j++)
            if (tiles[i] > tiles[j]) inversions++;
        }
        const emptyRowFromBottom = size - Math.floor(board.indexOf(0) / size);
        expect(
          size % 2 === 1
            ? inversions % 2
            : (inversions + emptyRowFromBottom) % 2,
        ).toBe(size % 2 === 1 ? 0 : 1);
      }
    },
  );
});
