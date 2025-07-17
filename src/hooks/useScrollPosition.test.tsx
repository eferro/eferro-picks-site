import { renderHook } from '@testing-library/react';
import { useScrollPosition } from './useScrollPosition';
import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';
import { useLocation } from 'react-router-dom';

const SCROLL_INDEX_KEY = 'scroll_index';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useLocation: vi.fn()
}));

describe('useScrollPosition', () => {
  describe('saving scroll position', () => {
    const mockStorage = {
      store: {} as Record<string, string>,
      clear() {
        this.store = {};
      },
      getItem(key: string) {
        return this.store[key] || null;
      },
      setItem(key: string, value: string) {
        this.store[key] = value;
      },
      removeItem(key: string) {
        delete this.store[key];
      },
      key(index: number) {
        return Object.keys(this.store)[index] || null;
      },
      length: 0
    };

    beforeEach(() => {
      vi.useFakeTimers();
      
      // Reset window.scrollY
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        value: 0,
        configurable: true
      });
      
      // Mock required methods
      window.scrollTo = vi.fn().mockImplementation((x, y) => {
        // Update scrollY when scrollTo is called
        Object.defineProperty(window, 'scrollY', {
          writable: true,
          value: y,
          configurable: true
        });
      });
      
      // Mock sessionStorage
      Object.defineProperty(window, 'sessionStorage', {
        value: mockStorage,
        writable: true
      });
      
      // Spy on our mock implementation
      vi.spyOn(mockStorage, 'setItem');
      vi.spyOn(mockStorage, 'getItem');
      
      // Spy on window event listeners
      vi.spyOn(window, 'addEventListener');
      vi.spyOn(window, 'removeEventListener');
      
      mockStorage.clear();
      
      // Mock location
      (useLocation as Mock).mockReturnValue({ pathname: '/' });
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.clearAllMocks();
      vi.restoreAllMocks();
    });

    it('saves scroll position when scrolling', () => {
      // Render the hook
      renderHook(() => useScrollPosition());
      
      // Set scroll position and trigger scroll event
      Object.defineProperty(window, 'scrollY', {
        value: 100,
        configurable: true,
        writable: true
      });
      
      // Trigger scroll event
      window.dispatchEvent(new Event('scroll'));
      
      // Run timers
      vi.advanceTimersByTime(100);
      
      // Verify sessionStorage was called with correct values
      expect(mockStorage.setItem).toHaveBeenCalledWith(SCROLL_INDEX_KEY, '100');
    });

    it('restores scroll position when returning to index page', () => {
      // Setup: Save a scroll position
      mockStorage.store[SCROLL_INDEX_KEY] = '150';
      
      // Render hook (simulating return to index page)
      renderHook(() => useScrollPosition());
      
      // Run initial delay timer (100ms)
      vi.advanceTimersByTime(100);
      
      // Verify window was scrolled to saved position
      expect(window.scrollTo).toHaveBeenCalledWith(0, 150);
      
      // Since our mock updates scrollY, no retry should be needed
      expect(window.scrollTo).toHaveBeenCalledTimes(1);
    });

    it('scrolls to top when navigating to non-index page', () => {
      // Setup: Mock a non-index page location
      (useLocation as Mock).mockReturnValue({ pathname: '/talks/123' });
      
      // Setup: Save a previous scroll position
      mockStorage.store[SCROLL_INDEX_KEY] = '200';
      
      // Set current scroll position
      Object.defineProperty(window, 'scrollY', {
        value: 300,
        configurable: true,
        writable: true
      });
      
      // Render hook (simulating navigation to detail page)
      renderHook(() => useScrollPosition());
      
      // Verify immediate scroll to top
      expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
      expect(window.scrollTo).toHaveBeenCalledTimes(1);
      expect(window.scrollY).toBe(0);
      
      // Verify no scroll events are handled
      window.dispatchEvent(new Event('scroll'));
      vi.advanceTimersByTime(100);
      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });

    it('cleans up event listeners and timeouts when unmounting', () => {
      // Setup: Render hook on index page
      const { unmount } = renderHook(() => useScrollPosition());
      
      // Verify event listener was added
      expect(window.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
      
      // Get the actual event handler that was registered
      const scrollHandler = (window.addEventListener as Mock).mock.calls.find(
        call => call[0] === 'scroll'
      )?.[1];
      
      // Trigger a scroll event but don't let the timer complete
      window.dispatchEvent(new Event('scroll'));
      
      // Unmount the hook
      unmount();
      
      // Verify event listener was removed with the same handler
      expect(window.removeEventListener).toHaveBeenCalledWith('scroll', scrollHandler);
      
      // Advance timer and verify no storage updates happened after unmount
      vi.advanceTimersByTime(100);
      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });

    it('debounces multiple scroll events and only saves the last position', () => {
      // Render the hook
      renderHook(() => useScrollPosition());
      
      // Simulate rapid scrolling
      for (let i = 0; i < 5; i++) {
        Object.defineProperty(window, 'scrollY', {
          value: i * 100,
          configurable: true,
          writable: true
        });
        window.dispatchEvent(new Event('scroll'));
        vi.advanceTimersByTime(50); // Less than debounce time
      }
      
      // At this point, no storage updates should have happened yet
      expect(mockStorage.setItem).not.toHaveBeenCalled();
      
      // Advance timer to complete the last debounce
      vi.advanceTimersByTime(100);
      
      // Verify only the last position was saved
      expect(mockStorage.setItem).toHaveBeenCalledTimes(1);
      expect(mockStorage.setItem).toHaveBeenCalledWith(SCROLL_INDEX_KEY, '400');
    });

    it('retries scroll restoration with exponential backoff when target not reached', () => {
      // Setup: Save a scroll position
      mockStorage.store[SCROLL_INDEX_KEY] = '500';
      
      // Mock scrollTo to simulate failed scroll attempts
      window.scrollTo = vi.fn().mockImplementation((x, y) => {
        // Simulate scroll not reaching target (off by 20px)
        Object.defineProperty(window, 'scrollY', {
          writable: true,
          value: Math.max(0, y - 20),
          configurable: true
        });
      });
      
      // Render hook
      renderHook(() => useScrollPosition());
      
      // Initial delay
      vi.advanceTimersByTime(100);
      
      // First attempt
      expect(window.scrollTo).toHaveBeenCalledWith(0, 500);
      expect(window.scrollY).toBe(480); // 20px off target
      
      // Verify exponential backoff timing
      for (let attempt = 1; attempt < 5; attempt++) {
        const backoffDelay = Math.min(100 * Math.pow(2, attempt), 2000);
        vi.advanceTimersByTime(backoffDelay);
        expect(window.scrollTo).toHaveBeenCalledWith(0, 500);
      }
      
      // After 5 attempts, fix the scroll behavior
      window.scrollTo = vi.fn().mockImplementation((x, y) => {
        Object.defineProperty(window, 'scrollY', {
          writable: true,
          value: y,
          configurable: true
        });
      });
      
      // Advance timer for next attempt
      vi.advanceTimersByTime(2000); // Max delay
      
      // Verify scroll succeeded and stopped retrying
      expect(window.scrollY).toBe(500);
      const totalCalls = (window.scrollTo as Mock).mock.calls.length;
      
      // No more calls should happen
      vi.advanceTimersByTime(2000);
      expect(window.scrollTo).toHaveBeenCalledTimes(totalCalls);
    });

    it('ignores invalid saved scroll position', () => {
      mockStorage.store[SCROLL_INDEX_KEY] = 'not-a-number';
      const removeSpy = vi.spyOn(mockStorage, 'removeItem');

      renderHook(() => useScrollPosition());

      vi.advanceTimersByTime(100);

      expect(removeSpy).toHaveBeenCalledWith(SCROLL_INDEX_KEY);
      expect(window.scrollTo).not.toHaveBeenCalled();
    });
  });
});
