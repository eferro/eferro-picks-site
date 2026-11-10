import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import App from './App';

// Smoke test of the whole app: no component mocks. setup.ts serves the
// real public/data/talks.json through fetch. Routing under the GitHub
// Pages base path (/eferro-picks-site/) is covered by the e2e tests.
const talksCount = (JSON.parse(
  readFileSync(join(process.cwd(), 'public', 'data', 'talks.json'), 'utf-8')
) as unknown[]).length;

// Rendering every real talk takes ~1-2s; give it explicit headroom so a
// slow CI runner reports a missing element, not a test timeout.
const RENDER_TIMEOUT_MS = 10_000;

describe('App', () => {
  it('renders the home page with every real talk, inside the header and footer', async () => {
    render(<App />);

    expect(
      await screen.findByText(`Showing ${talksCount} of ${talksCount} talks`, {}, { timeout: RENDER_TIMEOUT_MS })
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: "eferro's picks logo" })).toBeInTheDocument();
    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Edu Ferro');
  }, RENDER_TIMEOUT_MS + 5_000);
});
