import { test, expect, type APIRequestContext } from '@playwright/test';

/**
 * E2E journeys around opening talks and the search box, against the
 * production build served like GitHub Pages (see e2e/pages-server.mjs).
 */

const BASE = '/eferro-picks-site/';

interface TalkData {
  id: string;
  title: string;
  speakers: string[];
  topics: string[];
}

async function fetchTalks(request: APIRequestContext): Promise<TalkData[]> {
  const response = await request.get(`${BASE}data/talks.json`);
  expect(response.ok()).toBe(true);
  return response.json();
}

test.describe('Deep links on GitHub Pages', () => {
  test('a talk URL opened directly is served through 404.html and renders the talk', async ({ page, request }) => {
    const [talk] = await fetchTalks(request);

    const response = await page.goto(`${BASE}talk/${talk.id}`);

    expect(response?.status()).toBe(404); // GitHub Pages SPA fallback
    await expect(page.getByRole('heading', { level: 1, name: talk.title })).toBeVisible();
  });
});

test.describe('Opening talks in a new tab', () => {
  test('the card title is a real link to the talk that keeps the active filters', async ({ page }) => {
    await page.goto(`${BASE}?hasNotes=true`);

    const firstCard = page.getByTestId('talk-section').getByRole('article').first();
    const href = await firstCard.getByRole('heading').getByRole('link').getAttribute('href');

    expect(href).toMatch(new RegExp(`^${BASE}talk/[^?]+\\?hasNotes=true$`));
  });

  test('Ctrl+click on a card opens the talk in a new tab and keeps the list in the current one', async ({ page, context }) => {
    await page.goto(`${BASE}?hasNotes=true`);
    const firstCard = page.getByTestId('talk-section').getByRole('article').first();

    const [newTab] = await Promise.all([
      context.waitForEvent('page'),
      // Click the card's padding, away from its links and buttons
      firstCard.click({ modifiers: ['ControlOrMeta'], position: { x: 8, y: 8 } }),
    ]);

    await newTab.waitForURL(new RegExp(`${BASE}talk/`));
    expect(new URL(newTab.url()).pathname).toMatch(new RegExp(`^${BASE}talk/`));
    expect(new URL(newTab.url()).search).toBe('?hasNotes=true');
    await expect(newTab.getByRole('link', { name: /back to talks/i })).toBeVisible();
    expect(new URL(page.url()).pathname).toBe(BASE);
  });
});

test.describe('Search box', () => {
  test('shows the query from the URL and keeps it after visiting a talk and coming back', async ({ page, request }) => {
    const talks = await fetchTalks(request);
    const speaker = talks.find(t => t.speakers.length)!.speakers[0];
    await page.goto(`${BASE}?query=${encodeURIComponent(speaker)}`);
    const searchBox = page.getByRole('combobox', { name: 'Search talks' });
    await expect(searchBox).toHaveValue(speaker);

    await page.getByTestId('talk-section').getByRole('article').first().click();
    await expect(page.getByRole('link', { name: /back to talks/i })).toBeVisible();
    await page.getByRole('link', { name: /back to talks/i }).click();

    await expect(searchBox).toHaveValue(speaker);
  });

  test('suggestions can be chosen with the keyboard and Enter then searches', async ({ page, request }) => {
    const talks = await fetchTalks(request);
    const topic = talks.flatMap(t => t.topics).find(t => /^[a-z]{4,}$/i.test(t))!;
    await page.goto(BASE);
    const searchBox = page.getByRole('combobox', { name: 'Search talks' });

    await searchBox.fill(topic.slice(0, 3));
    await expect(page.getByRole('listbox')).toBeVisible();
    await searchBox.press('ArrowDown');
    await searchBox.press('Enter');
    const chosen = await searchBox.inputValue();
    await searchBox.press('Enter');

    await expect(page.getByRole('button', { name: 'Remove search filter' })).toContainText(chosen);
    expect(new URL(page.url()).searchParams.get('query')).toBe(chosen);
  });
});
