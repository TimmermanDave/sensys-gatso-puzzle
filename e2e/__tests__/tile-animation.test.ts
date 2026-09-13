import { expect, test } from '@playwright/test';

test('tiles animate in all four directions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.getByRole('button', { name: /^Tile / })).toHaveCount(8);

  // Put the empty cell in the center, without depending on a shuffled board.
  await page.evaluate(async () => {
    document.documentElement.style.setProperty('--motion-duration', '0ms');
    const frame = () => new Promise(requestAnimationFrame);
    for (let step = 0; step < 4; step++) {
      const tiles = [
        ...document.querySelectorAll<HTMLButtonElement>(
          '[aria-label^="Tile "]',
        ),
      ];
      const position = (tile: HTMLButtonElement) =>
        Number(tile.style.getPropertyValue('--row')) * 3 +
        Number(tile.style.getPropertyValue('--column'));
      const empty = Array.from({ length: 9 }, (_, index) => index).find(
        (index) => !tiles.some((tile) => position(tile) === index),
      )!;
      if (empty === 4) break;
      const next = empty < 3 ? empty + 3 : empty > 5 ? empty - 3 : 4;
      tiles.find((tile) => position(tile) === next)!.click();
      await frame();
      await frame();
    }
    document.documentElement.style.setProperty('--motion-duration', '1000ms');
  });

  for (const direction of ['down', 'up', 'right', 'left'] as const) {
    const animated = await page.evaluate(async (direction) => {
      const tiles = [
        ...document.querySelectorAll<HTMLButtonElement>(
          '[aria-label^="Tile "]',
        ),
      ];
      const position = (tile: HTMLButtonElement) =>
        Number(tile.style.getPropertyValue('--row')) * 3 +
        Number(tile.style.getPropertyValue('--column'));
      const empty = Array.from({ length: 9 }, (_, index) => index).find(
        (index) => !tiles.some((tile) => position(tile) === index),
      )!;
      const offset = { down: -3, up: 3, right: -1, left: 1 }[direction];
      const tile = tiles.find((tile) => position(tile) === empty + offset)!;
      // Flush the starting style before moving the tile.
      tile.getBoundingClientRect();
      tile.click();
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
      const animations = tile.getAnimations();
      const moving = animations.some(
        (animation) =>
          animation instanceof CSSTransition &&
          ['top', 'left', 'transform', 'translate'].includes(
            animation.transitionProperty,
          ),
      );
      for (const animation of animations) animation.finish();
      return moving;
    }, direction);
    expect(animated, `${direction} should animate`).toBe(true);
  }
});
