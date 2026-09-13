// Public API contract. Keep this module free of server runtime dependencies.
export const puzzleSizes = [3, 4, 5] as const;
export type PuzzleSize = (typeof puzzleSizes)[number];
export type Board = readonly number[];

export interface GameSnapshot {
  id: string;
  size: PuzzleSize;
  board: Board;
  moves: number;
  solved: boolean;
  version: number;
  legalMoves: readonly number[];
}

export interface CreateGameRequest {
  size: PuzzleSize;
}

export interface RestartGameRequest {
  version: number;
}

export interface MoveRequest extends RestartGameRequest {
  index: number;
}

export type GameRequest = CreateGameRequest | MoveRequest | RestartGameRequest;
export interface ApiError {
  error: string;
}

export interface ApiResponse {
  status: number;
  data: GameSnapshot | ApiError;
}
