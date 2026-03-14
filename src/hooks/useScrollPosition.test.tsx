import React from 'react';
import { renderHook } from '@testing-library/react';
import { useScrollPosition, ScrollConfig } from './useScrollPosition';
import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { setMockSearchParams } from '../test/utils';
import { createWindowDouble, createSpiedWindowDouble } from '../test/doubles/window';

const SCROLL_INDEX_KEY = 'scroll_index';

// Fast test configuration - no duplicating production timing logic!
const TEST_CONFIG: ScrollConfig = {
  debounceMs: 10,      // Fast for tests
  initialDelayMs: 10,  // Fast initial delay
  retryDelayMs: 10,    // Fast retry delay
  maxRetries: 3,       // Fewer retries in tests
  maxDelayMs: 100,     // Lower max delay
};

// Helper to create router wrapper with specific initial location
const createRouterWrapper = (initialPath: string = '/') => {
  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[initialPath]}>
      {children}
    </MemoryRouter>
  );
};

describe('useScrollPosition', () => {
  describe('saving scroll position', () => {
    let spiedWindow: ReturnType<typeof createSpiedWindowDouble>;

    beforeEach(() => {
      vi.useFakeTimers();

      // Create window test double with instant scroll behavior
      spiedWindow = createSpiedWindowDouble(vi, { scrollBehavior: 'instant' });

      // Replace global window properties with test double
      Object.defineProperty(window, 'scrollY', {
        get: () => spiedWindow.scrollY,
        configurable: true
      });
      (window as Window).scrollTo = spiedWindow.scrollTo as typeof window.scrollTo;
      (window as Window).addEventListener = spiedWindow.addEventListener as typeof window.addEventListener;
      (window as Window).removeEventListener = spiedWindow.removeEventListener as typeof window.removeEventListener;
      (window as Window).dispatchEvent = spiedWindow.dispatchEvent as typeof window.dispatchEvent;
      Object.defineProperty(window, 'sessionStorage', {
        value: spiedWindow.sessionStorage,
        writable: true,
        configurable: true
      });

      // Spy on sessionStorage methods
      vi.spyOn(spiedWindow.sessionStorage, 'setItem');
      vi.spyOn(spiedWindow.sessionStorage, 'getItem');
      vi.spyOn(spiedWindow.sessionStorage, 'removeItem');

      // Reset search params to simulate index page
      setMockSearchParams(new URLSearchParams());
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.clearAllMocks();
      vi.restoreAllMocks();
    });

    it('saves scroll position when scrolling', () => {
      // Render the hook with test config
      renderHook(() => useScrollPosition(TEST_CONFIG), {
        wrapper: createRouterWrapper('/')
      });

      // Scroll to position 100
      spiedWindow.scrollTo(0, 100);

      // Trigger scroll event
      window.dispatchEvent(new Event('scroll'));

      // Run timers (using test config debounce time)
      vi.advanceTimersByTime(TEST_CONFIG.debounceMs);

      // Verify sessionStorage was called with correct values
      expect(spiedWindow.sessionStorage.setItem).toHaveBeenCalledWith(SCROLL_INDEX_KEY, '100');
    });

    it('restores scroll position when returning to index page', () => {
      // Setup: Save a scroll position
      spiedWindow.sessionStorage.setItem(SCROLL_INDEX_KEY, '150');

      // Render hook with test config
      renderHook(() => useScrollPosition(TEST_CONFIG), {
        wrapper: createRouterWrapper('/')
      });

      // Run initial delay timer (using test config)
      vi.advanceTimersByTime(TEST_CONFIG.initialDelayMs);

      // Verify window was scrolled to saved position
      expect(spiedWindow.scrollTo).toHaveBeenCalledWith(0, 150);

      // Since our test double updates scrollY instantly, no retry should be needed
      expect(spiedWindow.scrollTo).toHaveBeenCalledTimes(1);
    });

    it('scrolls to top when navigating to non-index page', () => {
      // Setup: Save a previous scroll position and set current position
      spiedWindow.sessionStorage.setItem(SCROLL_INDEX_KEY, '200');
      spiedWindow.scrollTo(0, 300);

      // Clear mocks after setup to isolate test behavior
      vi.clearAllMocks();

      // Render hook simulating navigation to detail page
      renderHook(() => useScrollPosition(TEST_CONFIG), {
        wrapper: createRouterWrapper('/talks/123')
      });

      // Verify immediate scroll to top
      expect(spiedWindow.scrollTo).toHaveBeenCalledWith(0, 0);
      expect(spiedWindow.scrollTo).toHaveBeenCalledTimes(1);
      expect(window.scrollY).toBe(0);

      // Verify no scroll events are handled
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(TEST_CONFIG.debounceMs);
      expect(spiedWindow.sessionStorage.setItem).not.toHaveBeenCalled();
    });

    it('cleans up event listeners and timeouts when unmounting', () => {
      // Setup: Render hook on index page
      const { unmount } = renderHook(() => useScrollPosition(TEST_CONFIG), {
        wrapper: createRouterWrapper('/')
      });

      // Verify event listener was added
      expect(spiedWindow.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });

      // Get the actual event handler that was registered
      const scrollHandler = (spiedWindow.addEventListener as Mock).mock.calls.find(
        call => call[0] === 'scroll'
      )?.[1];

      // Trigger a scroll event but don't let the timer complete
      window.dispatchEvent(new Event('scroll'));

      // Unmount the hook
      unmount();

      // Verify event listener was removed with the same handler
      expect(spiedWindow.removeEventListener).toHaveBeenCalledWith('scroll', scrollHandler);

      // Advance timer and verify no storage updates happened after unmount
      vi.advanceTimersByTime(TEST_CONFIG.debounceMs);
      expect(spiedWindow.sessionStorage.setItem).not.toHaveBeenCalled();
    });

    it('debounces multiple scroll events and only saves the last position', () => {
      // Render the hook with test config
      renderHook(() => useScrollPosition(TEST_CONFIG), {
        wrapper: createRouterWrapper('/')
      });

      // Simulate rapid scrolling
      for (let i = 0; i < 5; i++) {
        spiedWindow.scrollTo(0, i * 100);
        window.dispatchEvent(new Event('scroll'));
        vi.advanceTimersByTime(5); // Less than debounce time
      }

      // At this point, no storage updates should have happened yet
      expect(spiedWindow.sessionStorage.setItem).not.toHaveBeenCalled();

      // Advance timer to complete the last debounce
      vi.advanceTimersByTime(TEST_CONFIG.debounceMs);

      // Verify only the last position was saved
      expect(spiedWindow.sessionStorage.setItem).toHaveBeenCalledTimes(1);
      expect(spiedWindow.sessionStorage.setItem).toHaveBeenCalledWith(SCROLL_INDEX_KEY, '400');
    });

    it('retries scroll restoration when target not reached', () => {
      /**
       * CONTEXT: This tests the retry mechanism that handles cases where
       * the DOM hasn't fully rendered yet, preventing a jarring scroll jump.
       *
       * Now we use TEST_CONFIG and WindowDouble with 'partial' behavior!
       */

      // Setup: Create window double with partial scroll behavior (simulates incomplete scroll)
      const partialWindow = createSpiedWindowDouble(vi, {
        scrollBehavior: 'partial',
        scrollOffset: 20
      });

      // Replace window with partial scroll double
      Object.defineProperty(window, 'scrollY', {
        get: () => partialWindow.scrollY,
        configurable: true
      });
      (window as Window).scrollTo = partialWindow.scrollTo as typeof window.scrollTo;

      // Save a scroll position
      spiedWindow.sessionStorage.setItem(SCROLL_INDEX_KEY, '500');

      // Render hook with test config
      renderHook(() => useScrollPosition(TEST_CONFIG), {
        wrapper: createRouterWrapper('/')
      });

      // Initial delay
      vi.advanceTimersByTime(TEST_CONFIG.initialDelayMs);

      // First attempt
      expect(partialWindow.scrollTo).toHaveBeenCalledWith(0, 500);
      expect(window.scrollY).toBe(480); // 20px off target

      // Verify retries happen with exponential backoff
      for (let attempt = 1; attempt <= TEST_CONFIG.maxRetries; attempt++) {
        const backoffDelay = Math.min(
          TEST_CONFIG.retryDelayMs * Math.pow(2, attempt),
          TEST_CONFIG.maxDelayMs
        );
        vi.advanceTimersByTime(backoffDelay);
      }

      // Verify multiple retry attempts were made
      expect(partialWindow.scrollTo).toHaveBeenCalledTimes(TEST_CONFIG.maxRetries);
    });

    it('stops retrying when scroll position is reached', () => {
      // Setup: Create custom window double that succeeds on second attempt
      let callCount = 0;
      const customWindow = createWindowDouble();
      const customScrollTo = vi.fn((x: number, y: number) => {
        callCount++;
        if (callCount === 1) {
          // First attempt: partial scroll (simulates DOM not ready)
          customWindow.scrollTo(0, y - 20);
        } else {
          // Second attempt: success!
          customWindow.scrollTo(0, y);
        }
      });

      // Replace window with custom behavior
      Object.defineProperty(window, 'scrollY', {
        get: () => customWindow.scrollY,
        configurable: true
      });
      (window as Window).scrollTo = customScrollTo as typeof window.scrollTo;

      // Save a scroll position
      spiedWindow.sessionStorage.setItem(SCROLL_INDEX_KEY, '300');

      // Render hook with test config
      renderHook(() => useScrollPosition(TEST_CONFIG), {
        wrapper: createRouterWrapper('/')
      });

      // Initial delay
      vi.advanceTimersByTime(TEST_CONFIG.initialDelayMs);
      expect(window.scrollY).toBe(280); // First attempt: off by 20px

      // First retry with exponential backoff
      vi.advanceTimersByTime(TEST_CONFIG.retryDelayMs * 2); // 2^1 = 2
      expect(window.scrollY).toBe(300); // Success!

      const callsAfterSuccess = customScrollTo.mock.calls.length;

      // Advance time further - no more retries should happen
      vi.advanceTimersByTime(TEST_CONFIG.maxDelayMs * 2);
      expect(customScrollTo).toHaveBeenCalledTimes(callsAfterSuccess);
    });

    it('ignores invalid saved scroll position', () => {
      spiedWindow.sessionStorage.setItem(SCROLL_INDEX_KEY, 'not-a-number');

      renderHook(() => useScrollPosition(TEST_CONFIG), {
        wrapper: createRouterWrapper('/')
      });

      vi.advanceTimersByTime(TEST_CONFIG.initialDelayMs);

      expect(spiedWindow.sessionStorage.removeItem).toHaveBeenCalledWith(SCROLL_INDEX_KEY);
      expect(spiedWindow.scrollTo).not.toHaveBeenCalled();
    });
  });
});
