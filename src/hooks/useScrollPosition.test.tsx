import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useNavigate } from 'react-router-dom';
import { useScrollPosition, ScrollConfig } from './useScrollPosition';
import { routerWrapper } from '../test/router';

/**
 * The index page remembers its scroll position (sessionStorage) so that
 * coming back from a talk detail returns the user to where they were.
 * Restoration retries with exponential backoff because the list may still
 * be rendering. Any other page starts at the top.
 */

const SCROLL_INDEX_KEY = 'scroll_index';

const TEST_CONFIG: ScrollConfig = {
  debounceMs: 10,
  initialDelayMs: 10,
  retryDelayMs: 10,
  maxRetries: 3,
  maxDelayMs: 100,
};

/**
 * Simulated page scrolling on top of happy-dom's window: scrollTo moves
 * scrollY, optionally landing `shortBy` px before the target to simulate
 * content that is not fully rendered yet.
 */
function fakePageScroll() {
  let scrollY = 0;
  let shortBy = 0;
  Object.defineProperty(window, 'scrollY', { configurable: true, get: () => scrollY });
  const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(
    ((xOrOptions?: number | ScrollToOptions, y?: number) => {
      const target = typeof xOrOptions === 'number' ? (y ?? 0) : (xOrOptions?.top ?? 0);
      scrollY = Math.max(0, target - shortBy);
    }) as typeof window.scrollTo
  );

  return {
    scrollTo,
    contentNotReady: (px: number) => { shortBy = px; },
    contentReady: () => { shortBy = 0; },
    userScrollsTo: (y: number) => {
      scrollY = y;
      window.dispatchEvent(new Event('scroll'));
    },
  };
}

/** Renders the hook on `path` and returns navigate() to move around. */
const renderOn = (path: string, config: ScrollConfig = TEST_CONFIG) =>
  renderHook(() => {
    useScrollPosition(config);
    return useNavigate();
  }, { wrapper: routerWrapper({ path }) });

describe('useScrollPosition', () => {
  const originalScrollY = Object.getOwnPropertyDescriptor(window, 'scrollY');
  let page: ReturnType<typeof fakePageScroll>;

  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    page = fakePageScroll();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    if (originalScrollY) {
      Object.defineProperty(window, 'scrollY', originalScrollY);
    } else {
      delete (window as { scrollY?: number }).scrollY;
    }
  });

  describe('saving on the index page', () => {
    it('saves the position once scrolling settles', () => {
      renderOn('/');

      page.userScrollsTo(100);
      vi.advanceTimersByTime(TEST_CONFIG.debounceMs - 1);
      expect(sessionStorage.getItem(SCROLL_INDEX_KEY)).toBeNull();
      vi.advanceTimersByTime(1);

      expect(sessionStorage.getItem(SCROLL_INDEX_KEY)).toBe('100');
    });

    it('saves only the last position of a burst of scroll events', () => {
      renderOn('/');

      for (const y of [100, 200, 300, 400]) {
        page.userScrollsTo(y);
        vi.advanceTimersByTime(TEST_CONFIG.debounceMs / 2);
        expect(sessionStorage.getItem(SCROLL_INDEX_KEY)).toBeNull();
      }
      vi.advanceTimersByTime(TEST_CONFIG.debounceMs);

      expect(sessionStorage.getItem(SCROLL_INDEX_KEY)).toBe('400');
    });

    it('does not save on other pages', () => {
      renderOn('/talk/123');

      page.userScrollsTo(200);
      vi.advanceTimersByTime(TEST_CONFIG.debounceMs);

      expect(sessionStorage.getItem(SCROLL_INDEX_KEY)).toBeNull();
    });

    it('stops saving after unmount', () => {
      const { unmount } = renderOn('/');
      page.userScrollsTo(100);

      unmount();
      page.userScrollsTo(200);
      vi.advanceTimersByTime(TEST_CONFIG.debounceMs * 10);

      expect(sessionStorage.getItem(SCROLL_INDEX_KEY)).toBeNull();
    });
  });

  describe('restoring on the index page', () => {
    it('scrolls back to the saved position after the initial delay', () => {
      sessionStorage.setItem(SCROLL_INDEX_KEY, '150');
      renderOn('/');

      vi.advanceTimersByTime(TEST_CONFIG.initialDelayMs);

      expect(page.scrollTo).toHaveBeenCalledWith(0, 150);
      expect(page.scrollTo).toHaveBeenCalledTimes(1);
    });

    it('retries until the position is reached and then stops', () => {
      sessionStorage.setItem(SCROLL_INDEX_KEY, '300');
      page.contentNotReady(20);
      renderOn('/');
      vi.advanceTimersByTime(TEST_CONFIG.initialDelayMs);
      expect(window.scrollY).toBe(280);

      page.contentReady();
      vi.advanceTimersByTime(TEST_CONFIG.retryDelayMs);
      expect(window.scrollY).toBe(300);
      const callsWhenReached = page.scrollTo.mock.calls.length;

      vi.advanceTimersByTime(TEST_CONFIG.maxDelayMs * 10);
      expect(page.scrollTo).toHaveBeenCalledTimes(callsWhenReached);
    });

    it('gives up after the maximum number of attempts', () => {
      sessionStorage.setItem(SCROLL_INDEX_KEY, '500');
      page.contentNotReady(20);
      renderOn('/');

      vi.advanceTimersByTime(10_000);

      expect(page.scrollTo).toHaveBeenCalledTimes(TEST_CONFIG.maxRetries);
    });

    it('gets a fresh set of attempts every time the user comes back to the index', () => {
      sessionStorage.setItem(SCROLL_INDEX_KEY, '500');
      page.contentNotReady(20);
      const { result } = renderOn('/');
      vi.advanceTimersByTime(10_000); // first visit uses up every attempt

      act(() => result.current('/talk/1'));
      act(() => result.current('/'));
      page.scrollTo.mockClear();
      vi.advanceTimersByTime(10_000);

      expect(page.scrollTo).toHaveBeenCalledTimes(TEST_CONFIG.maxRetries);
    });

    describe('retry backoff timing', () => {
      // Small base delay and low cap so the cap is reached within a few retries
      const BACKOFF_CONFIG: ScrollConfig = { ...TEST_CONFIG, retryDelayMs: 10, maxRetries: 6, maxDelayMs: 50 };

      beforeEach(() => {
        sessionStorage.setItem(SCROLL_INDEX_KEY, '500');
        page.contentNotReady(20);
      });

      const expectScrollAttemptAfter = (delayMs: number, expectedCalls: number) => {
        vi.advanceTimersByTime(delayMs - 1);
        expect(page.scrollTo).toHaveBeenCalledTimes(expectedCalls - 1);
        vi.advanceTimersByTime(1);
        expect(page.scrollTo).toHaveBeenCalledTimes(expectedCalls);
      };

      it('doubles the delay between retries until it reaches the maximum delay', () => {
        renderOn('/', BACKOFF_CONFIG);
        vi.advanceTimersByTime(BACKOFF_CONFIG.initialDelayMs);
        expect(page.scrollTo).toHaveBeenCalledTimes(1);

        expectScrollAttemptAfter(10, 2); // first check uses the base delay
        expectScrollAttemptAfter(20, 3); // 10 * 2^1
        expectScrollAttemptAfter(40, 4); // 10 * 2^2
        expectScrollAttemptAfter(50, 5); // 10 * 2^3 = 80, capped at 50
        expectScrollAttemptAfter(50, 6); // stays at the cap
      });

      it('stops retrying after unmount', () => {
        const { unmount } = renderOn('/', BACKOFF_CONFIG);
        vi.advanceTimersByTime(BACKOFF_CONFIG.initialDelayMs + 10);
        const callsBeforeUnmount = page.scrollTo.mock.calls.length;

        unmount();
        vi.advanceTimersByTime(10_000);

        expect(page.scrollTo).toHaveBeenCalledTimes(callsBeforeUnmount);
      });
    });

    it('does not restore on other pages', () => {
      sessionStorage.setItem(SCROLL_INDEX_KEY, '300');
      renderOn('/talk/456');

      vi.advanceTimersByTime(10_000);

      expect(page.scrollTo).not.toHaveBeenCalledWith(0, 300);
    });
  });

  describe('validating the saved position', () => {
    it.each(['not-a-number', '   ', 'Infinity', '12.5', '-50'])(
      'discards "%s" without scrolling',
      (saved) => {
        sessionStorage.setItem(SCROLL_INDEX_KEY, saved);
        renderOn('/');

        vi.advanceTimersByTime(TEST_CONFIG.initialDelayMs);

        expect(sessionStorage.getItem(SCROLL_INDEX_KEY)).toBeNull();
        expect(page.scrollTo).not.toHaveBeenCalled();
      }
    );

    it('accepts zero', () => {
      sessionStorage.setItem(SCROLL_INDEX_KEY, '0');
      renderOn('/');

      vi.advanceTimersByTime(TEST_CONFIG.initialDelayMs);

      expect(page.scrollTo).toHaveBeenCalledWith(0, 0);
      expect(sessionStorage.getItem(SCROLL_INDEX_KEY)).toBe('0');
    });
  });

  describe('other pages start at the top', () => {
    it('scrolls to the top when opening a talk', () => {
      renderOn('/talk/123');

      expect(page.scrollTo).toHaveBeenCalledWith(0, 0);
    });

    it('scrolls to the top again when moving from one talk to another', () => {
      const { result } = renderOn('/talk/1');
      page.userScrollsTo(800);

      act(() => result.current('/talk/2'));

      expect(window.scrollY).toBe(0);
      expect(page.scrollTo).toHaveBeenCalledTimes(2);
    });
  });
});
