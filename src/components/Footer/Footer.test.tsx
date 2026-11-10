import { screen } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderWithRouter } from '../../test/router';
import { Footer } from './index';

describe('Footer', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([2025, 2031])('shows the current year (%i) in the copyright', (year) => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(year, 5, 15));

    renderWithRouter(<Footer />);

    expect(screen.getByText(new RegExp(`©\\s*${year}\\s*Edu Ferro`, 'i'))).toBeInTheDocument();
  });

  it('links to the website', () => {
    renderWithRouter(<Footer />);
    const link = screen.getByRole('link', { name: /visit my website/i });
    expect(link).toHaveAttribute('href', 'https://www.eferro.net');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the counter image with a text alternative', () => {
    renderWithRouter(<Footer />);
    const img = screen.getByRole('img', { name: 'Visit counter by LibreCounter' });
    expect(img).toHaveAttribute('src', 'https://librecounter.org/counter.svg');
  });

  it('gives the counter link an accessible name', () => {
    renderWithRouter(<Footer />);
    expect(screen.getByRole('link', { name: 'Visit counter by LibreCounter' }))
      .toHaveAttribute('href', 'https://librecounter.org/refer/show');
  });

  it('displays JSON API link pointing to talks data', () => {
    renderWithRouter(<Footer />);
    const apiLink = screen.getByRole('link', { name: /json api/i });
    expect(apiLink).toHaveAttribute('href', 'https://eferro.github.io/eferro-picks-site/data/talks.json');
    expect(apiLink).toHaveAttribute('target', '_blank');
    expect(apiLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
