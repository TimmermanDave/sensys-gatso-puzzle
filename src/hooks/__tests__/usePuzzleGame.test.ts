import { act, renderHook } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { canMove, shuffleBoard } from '../../domain/puzzle';
import { usePuzzleGame } from '../usePuzzleGame';
import * as puzzle from '../../domain/puzzle';

it('ignores illegal moves, counts legal moves, and restarts without requesting a seed', () => {
  const getSeed = vi.fn(() => 123);
  const { result } = renderHook(() =>
    usePuzzleGame({ initialSeed: 42, getSeed }),
  );
  const initial = result.current.board;
  act(() => result.current.move(initial.indexOf(0)));
  expect(result.current.board).toBe(initial);
  expect(result.current.moves).toBe(0);
  act(() =>
    result.current.move(
      initial.findIndex((_, index) => canMove(initial, 3, index)),
    ),
  );
  expect(result.current.moves).toBe(1);
  act(() => result.current.restart());
  expect(result.current.board).toEqual(initial);
  expect(result.current.moves).toBe(0);
  expect(getSeed).not.toHaveBeenCalled();
});

it('uses injected seeds for new games and preserves the chosen size', () => {
  const getSeed = vi
    .fn()
    .mockReturnValueOnce(1)
    .mockReturnValueOnce(2)
    .mockReturnValueOnce(3);
  const { result } = renderHook(() => usePuzzleGame({ getSeed }));
  expect(result.current.board).toEqual(shuffleBoard(3, 1));
  act(() => result.current.newGame(5));
  expect(result.current.board).toEqual(shuffleBoard(5, 2));
  act(() => result.current.newGame());
  expect(result.current.board).toEqual(shuffleBoard(5, 3));
  expect(result.current.moves).toBe(0);
  expect(getSeed).toHaveBeenCalledTimes(3);
});

it('locks a completed game at the state layer and allows a restart', () => {
  const initial = [1, 2, 3, 4, 5, 6, 7, 0, 8];
  vi.spyOn(puzzle, 'shuffleBoard').mockReturnValue(initial);
  const { result } = renderHook(() => usePuzzleGame({ initialSeed: 42 }));
  act(() => result.current.move(8));
  expect(result.current.solved).toBe(true);
  expect(result.current.moves).toBe(1);
  const solvedBoard = result.current.board;
  act(() => result.current.move(7));
  expect(result.current.board).toBe(solvedBoard);
  expect(result.current.moves).toBe(1);
  act(() => result.current.restart());
  expect(result.current.solved).toBe(false);
  expect(result.current.board).toEqual(initial);
  expect(result.current.moves).toBe(0);
});
