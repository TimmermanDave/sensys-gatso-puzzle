import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { createGameApi } from '../../server/api';

beforeEach(() => {
  const dispatch = createGameApi();
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const result = dispatch(
        init?.method ?? 'GET',
        url,
        init?.body ? JSON.parse(String(init.body)) : {},
      );
      return {
        ok: result.status < 400,
        status: result.status,
        json: async () => result.data,
      };
    }),
  );
});

afterEach(cleanup);
afterEach(() => vi.unstubAllGlobals());
