import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BackToTopButton } from './index';

describe('BackToTopButton', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(window, 'scrollY', { writable: true, value: 0 });
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows button after scrolling and scrolls to top on click', () => {
    render(<BackToTopButton />);
    expect(screen.queryByRole('button', { name: /back to top/i })).toBeNull();

    act(() => {
      Object.defineProperty(window, 'scrollY', { writable: true, value: 400 });
      window.dispatchEvent(new Event('scroll'));
    });

    const button = screen.getByRole('button', { name: /back to top/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('hides button when near top', () => {
    render(<BackToTopButton />);
    act(() => {
      Object.defineProperty(window, 'scrollY', { writable: true, value: 400 });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(screen.getByRole('button', { name: /back to top/i })).toBeInTheDocument();

    act(() => {
      Object.defineProperty(window, 'scrollY', { writable: true, value: 0 });
      window.dispatchEvent(new Event('scroll'));
    });
    expect(screen.queryByRole('button', { name: /back to top/i })).toBeNull();
  });
});
