import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

/**
 * E2E validation of the filter navigation UX (#61, #62, #63) plus a
 * regression guard for the category sidebar scroll fix.
 *
 * Tests run against the real talks.json data, so assertions are
 * relative (filtered subset vs. total) instead of hardcoding counts.
 */

const BASE = '/eferro-picks-site/';

interface TalkData {
  id: string;
  speakers: string[];
  topics: string[];
  conference_name?: string;
}

async function fetchTalks(request: APIRequestContext): Promise<TalkData[]> {
  const response = await request.get(`${BASE}data/talks.json`);
  expect(response.ok()).toBe(true);
  const data = await response.json();
  return Array.isArray(data) ? data : data.talks;
}

/** Reads "Showing X of Y talks" and returns { shown, total } */
async function readCounter(page: Page): Promise<{ shown: number; total: number }> {
  const counter = page.getByText(/^Showing \d+ of \d+ talks$/);
  await expect(counter).toBeVisible();
  const text = (await counter.textContent()) ?? '';
  const match = text.match(/^Showing (\d+) of (\d+) talks$/);
  expect(match).not.toBeNull();
  return { shown: Number(match![1]), total: Number(match![2]) };
}

test.describe('Filter visibility on the talks list (#61)', () => {
  test('arriving with a query in the URL shows a removable chip; removing it restores the full list', async ({ page, request }) => {
    const talks = await fetchTalks(request);
    const speaker = talks.find(t => t.speakers?.length)!.speakers[0];

    await page.goto(`${BASE}?query=${encodeURIComponent(speaker)}`);

    // Filter indication is visible and human-readable
    await expect(page.getByText('Search:')).toBeVisible();
    const chip = page.getByRole('button', { name: 'Remove search filter' });
    await expect(chip).toBeVisible();
    await expect(chip).toContainText(speaker);

    // List is actually filtered
    const filtered = await readCounter(page);
    expect(filtered.shown).toBeGreaterThan(0);
    expect(filtered.shown).toBeLessThan(filtered.total);

    // One click clears the filter, the list and the URL
    await chip.click();
    await expect(chip).toBeHidden();
    const restored = await readCounter(page);
    expect(restored.shown).toBe(restored.total);
    expect(page.url()).not.toContain('query=');
  });
});

test.describe('Talk detail metadata navigates to the filtered list (#62)', () => {
  let talk: TalkData;

  test.beforeEach(async ({ request }) => {
    const talks = await fetchTalks(request);
    talk = talks.find(t => t.speakers?.length && t.topics?.length && t.conference_name)!;
    expect(talk).toBeDefined();
  });

  test('clicking a speaker lands on the list filtered by that speaker', async ({ page }) => {
    await page.goto(`${BASE}talk/${talk.id}`);
    const speaker = talk.speakers[0];

    await page.getByRole('link', { name: `See all talks by ${speaker}` }).click();

    await expect(page).toHaveURL(new RegExp(`${BASE.replace(/\//g, '\\/')}\\?`));
    await expect(page.getByRole('button', { name: 'Remove search filter' })).toBeVisible();
    const { shown, total } = await readCounter(page);
    expect(shown).toBeGreaterThan(0);
    expect(shown).toBeLessThan(total);
  });

  test('clicking a topic lands on the list filtered by that topic', async ({ page }) => {
    await page.goto(`${BASE}talk/${talk.id}`);
    const topic = talk.topics[0];

    await page.getByRole('link', { name: `See all talks about ${topic}` }).click();

    await expect(page.getByRole('button', { name: 'Remove search filter' })).toBeVisible();
    const { shown, total } = await readCounter(page);
    expect(shown).toBeGreaterThan(0);
    expect(shown).toBeLessThan(total);
  });

  test('clicking the conference lands on the list filtered by that conference', async ({ page }) => {
    await page.goto(`${BASE}talk/${talk.id}`);

    await page.getByRole('link', { name: `See all talks from ${talk.conference_name}` }).click();

    await expect(page.getByText('Conference:')).toBeVisible();
    const { shown, total } = await readCounter(page);
    expect(shown).toBeGreaterThan(0);
    expect(shown).toBeLessThan(total);
  });

  test('"Back to Talks" preserves the filters active before entering the detail', async ({ page }) => {
    const conference = talk.conference_name!;
    await page.goto(`${BASE}?conference=${encodeURIComponent(conference)}`);
    await expect(page.getByText('Conference:')).toBeVisible();

    // Enter the first talk of the filtered list
    await page.getByRole('article').first().click();
    await expect(page.getByRole('link', { name: /back to talks/i })).toBeVisible();

    // Return: the conference filter is still applied and visible
    await page.getByRole('link', { name: /back to talks/i }).click();
    await expect(page.getByText('Conference:')).toBeVisible();
    const { shown, total } = await readCounter(page);
    expect(shown).toBeLessThan(total);
  });
});

test.describe('Search precision (#63)', () => {
  test('filtering by the short topic XP yields a relevant subset, not the whole collection', async ({ page }) => {
    await page.goto(`${BASE}?query=XP`);

    const { shown, total } = await readCounter(page);
    expect(shown).toBeGreaterThan(0);
    // Substring matching used to match ALL talks ("xp" inside "experience")
    expect(shown).toBeLessThan(total / 2);
  });
});

test.describe('Category sidebar (regression guard)', () => {
  test('every category stays reachable when the sidebar is taller than the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(BASE);

    const sidebar = page.locator('nav[aria-label="Category navigation"]');
    await expect(sidebar).toBeVisible();

    const lastCategory = sidebar.getByRole('button').last();
    await lastCategory.scrollIntoViewIfNeeded();
    await expect(lastCategory).toBeInViewport();
  });
});
