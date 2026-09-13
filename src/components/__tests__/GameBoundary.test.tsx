import { lazy, type ComponentType } from 'react';
import { act, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { GameBoundary } from '../../bounderies/GameBoundary';

it('shows loading content until a lazy child is ready', async () => {
  let resolve!: (module: { default: ComponentType }) => void;
  const module = new Promise<{ default: ComponentType }>((done) => {
    resolve = done;
  });
  const Child = lazy(() => module);
  render(
    <GameBoundary>
      <Child />
    </GameBoundary>,
  );
  expect(screen.getByRole('status')).toHaveTextContent('Loading puzzle…');
  await act(async () => {
    resolve({ default: () => <p>Ready to play</p> });
  });
  expect(screen.getByText('Ready to play')).toBeVisible();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

it('shows recovery UI when a lazy import fails', async () => {
  const Child = lazy(() => Promise.reject(new Error('Offline')));
  render(
    <GameBoundary>
      <Child />
    </GameBoundary>,
    { onCaughtError: () => {} },
  );
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'The puzzle couldn’t open.',
  );
  expect(screen.getByRole('button', { name: 'Reload game' })).toBeVisible();
});

it('contains render failures without removing content outside the boundary', () => {
  function Broken(): never {
    throw new Error('Render failed');
  }
  render(
    <>
      <h1>Slide</h1>
      <GameBoundary>
        <Broken />
      </GameBoundary>
    </>,
    { onCaughtError: () => {} },
  );
  expect(screen.getByRole('heading', { name: 'Slide' })).toBeVisible();
  expect(screen.getByRole('alert')).toBeVisible();
});
