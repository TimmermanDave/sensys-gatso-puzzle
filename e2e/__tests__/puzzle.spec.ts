import { expect, test } from '@playwright/test';

test('play, restart, and choose a larger puzzle on a narrow screen', async ({
  page,
}) => {
  // Reproducible boards without adding test-only controls to the app.
  await page.addInitScript(() => {
    let seed = 42;
    Object.defineProperty(crypto, 'getRandomValues', {
      value: (values: Uint32Array) => values.fill(seed++),
    });
  });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Sensys Gatso Puzzle' }),
  ).toBeVisible();
  const tiles = page.getByRole('button', { name: /^Tile / });
  await expect(tiles).toHaveCount(8);
  const initial = await tiles.evaluateAll((elements) =>
    elements.map((el) => ({
      value: el.textContent,
      position: el.getAttribute('style'),
    })),
  );
  await page
    .getByRole('button', { name: /^Tile /, disabled: true })
    .first()
    .click({ force: true });
  await expect(page.getByLabel('Moves', { exact: true })).toHaveText('0');
  await page
    .getByRole('button', { name: /^Tile /, disabled: false })
    .first()
    .click();
  await expect(page.getByLabel('Moves', { exact: true })).toHaveText('1');
  await page.getByRole('button', { name: 'Restart' }).click();
  await expect(page.getByLabel('Moves', { exact: true })).toHaveText('0');
  expect(
    await tiles.evaluateAll((elements) =>
      elements.map((el) => ({
        value: el.textContent,
        position: el.getAttribute('style'),
      })),
    ),
  ).toEqual(initial);
  await page.getByRole('radio', { name: '4 × 4' }).check();
  await expect(tiles).toHaveCount(15);
  await page.getByRole('radio', { name: '5 × 5' }).check();
  await expect(tiles).toHaveCount(24);
  const largerBoard = await tiles.evaluateAll((elements) =>
    elements.map((el) => ({
      value: el.textContent,
      position: el.getAttribute('style'),
    })),
  );
  await page
    .getByRole('button', { name: /^Tile /, disabled: false })
    .first()
    .click();
  await expect(page.getByLabel('Moves', { exact: true })).toHaveText('1');
  await page.getByRole('button', { name: 'New puzzle' }).click();
  await expect(page.getByLabel('Moves', { exact: true })).toHaveText('0');
  await expect(tiles).toHaveCount(24);
  expect(
    await tiles.evaluateAll((elements) =>
      elements.map((el) => ({
        value: el.textContent,
        position: el.getAttribute('style'),
      })),
    ),
  ).not.toEqual(largerBoard);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
