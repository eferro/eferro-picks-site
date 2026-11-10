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

describe('App', () => {
  it('loads the real talks data and lists every talk on the home page', async () => {
    render(<App />);

    expect(
      await screen.findByText(`Showing ${talksCount} of ${talksCount} talks`, {}, { timeout: 5000 })
    ).toBeInTheDocument();
  });

  it('renders the header, search and footer around the list', async () => {
    render(<App />);

    expect(screen.getByRole('img', { name: "eferro's picks logo" })).toBeInTheDocument();
    expect(await screen.findByRole('search')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Edu Ferro');
  });
});
