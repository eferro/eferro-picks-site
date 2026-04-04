import { screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderWithRouter } from '../../test/utils';
import { Footer } from './index';

describe('Footer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('displays current year and website link', () => {
    renderWithRouter(<Footer />);
    const year = '2025';
    expect(
      screen.getByText(new RegExp(`©\\s*${year}\\s*Edu Ferro`, 'i'))
    ).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /visit my website/i });
    expect(link).toHaveAttribute('href', 'https://www.eferro.net');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders the counter image', () => {
    renderWithRouter(<Footer />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://librecounter.org/counter.svg');
  });

  it('displays JSON API link pointing to talks data', () => {
    renderWithRouter(<Footer />);
    const apiLink = screen.getByRole('link', { name: /json api/i });
    expect(apiLink).toHaveAttribute('href', 'https://eferro.github.io/eferro-picks-site/data/talks.json');
    expect(apiLink).toHaveAttribute('target', '_blank');
    expect(apiLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
