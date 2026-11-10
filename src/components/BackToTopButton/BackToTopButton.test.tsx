import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BackToTopButton } from './index';

describe('BackToTopButton', () => {
  const originalScrollY = Object.getOwnPropertyDescriptor(window, 'scrollY');
  const originalScrollTo = window.scrollTo;

  const scrollPageTo = (y: number) => {
    act(() => {
      Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: y });
      window.dispatchEvent(new Event('scroll'));
    });
  };

  const backToTopButton = () => screen.queryByRole('button', { name: /back to top/i });

  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { configurable: true, writable: true, value: 0 });
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  });

  afterEach(() => {
    if (originalScrollY) {
      Object.defineProperty(window, 'scrollY', originalScrollY);
    } else {
      delete (window as { scrollY?: number }).scrollY;
    }
    window.scrollTo = originalScrollTo;
  });

  it.each([
    [300, false],
    [301, true],
  ])('at scroll position %i the button visible is %s', (y, visible) => {
    render(<BackToTopButton />);

    scrollPageTo(y);

    expect(backToTopButton() !== null).toBe(visible);
  });

  it('scrolls smoothly to the top when clicked', () => {
    render(<BackToTopButton />);
    scrollPageTo(400);

    fireEvent.click(screen.getByRole('button', { name: /back to top/i }));

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('hides again when scrolling back near the top', () => {
    render(<BackToTopButton />);
    scrollPageTo(400);

    scrollPageTo(0);

    expect(backToTopButton()).toBeNull();
  });
});
