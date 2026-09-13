import { act, renderHook, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { canMove } from '../../../server/domain/puzzle';
import { usePuzzleGame } from '../usePuzzleGame';

it('loads from the API, counts moves, and restarts the same board', async () => {
  const { result } = renderHook(() => usePuzzleGame());
  await waitFor(() => expect(result.current.pending).toBe(false));
  const initial = result.current.board;
  act(() => result.current.move(initial.indexOf(0)));
  expect(result.current.moves).toBe(0);
  act(() =>
    result.current.move(
      initial.findIndex((_, index) => canMove(initial, 3, index)),
    ),
  );
  await waitFor(() => expect(result.current.moves).toBe(1));
  act(() => result.current.restart());
  await waitFor(() => expect(result.current.moves).toBe(0));
  expect(result.current.board).toEqual(initial);
  act(() => result.current.newGame(5));
  await waitFor(() => expect(result.current.size).toBe(5));
});

it('blocks duplicate input while a move is pending', async () => {
  const { result } = renderHook(() => usePuzzleGame());
  await waitFor(() => expect(result.current.pending).toBe(false));
  const index = result.current.board.findIndex((_, i) =>
    canMove(result.current.board, 3, i),
  );
  act(() => {
    result.current.move(index);
    result.current.move(index);
  });
  await waitFor(() => expect(result.current.moves).toBe(1));
  expect(fetch).toHaveBeenCalledTimes(2);
});

it('recovers an uncertain mutation by reading state rather than repeating it', async () => {
  const { result } = renderHook(() => usePuzzleGame());
  await waitFor(() => expect(result.current.pending).toBe(false));
  const realFetch = vi.mocked(fetch).getMockImplementation()!;
  vi.mocked(fetch).mockImplementationOnce(async (...args) => {
    await realFetch(...args);
    throw new Error('Connection lost');
  });
  act(() =>
    result.current.move(
      result.current.board.findIndex((_, i) =>
        canMove(result.current.board, 3, i),
      ),
    ),
  );
  await waitFor(() => expect(result.current.error).toBe('Connection lost'));
  act(() => result.current.retry());
  await waitFor(() => expect(result.current.moves).toBe(1));
  expect(result.current.error).toBeNull();
  expect(fetch).toHaveBeenLastCalledWith(
    expect.any(String),
    expect.objectContaining({ method: 'GET' }),
  );
});

it('allows retry after initial loading fails', async () => {
  vi.mocked(fetch).mockRejectedValueOnce(new Error('Offline'));
  const { result } = renderHook(() => usePuzzleGame());
  await waitFor(() => expect(result.current.error).toBe('Offline'));
  act(() => result.current.retry());
  await waitFor(() => expect(result.current.ready).toBe(true));
});
