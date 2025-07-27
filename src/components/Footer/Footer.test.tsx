import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { renderWithRouter } from '../../test/utils';
import { Footer } from './index';

describe('Footer', () => {
  it('displays current year and website link', () => {
    renderWithRouter(<Footer />);
    const year = new Date().getFullYear().toString();
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
    expect(img).toHaveClass('h-6 w-auto opacity-50 hover:opacity-75 transition-opacity');
  });
});
