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
      window.scrollTo = vi.fn();
      
      // Mock sessionStorage
      Object.defineProperty(window, 'sessionStorage', {
        value: mockStorage,
        writable: true
      });
      
      // Spy on our mock implementation
      vi.spyOn(mockStorage, 'setItem');
      vi.spyOn(mockStorage, 'getItem');
      
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
      mockStorage.setItem(SCROLL_INDEX_KEY, '150');
      
      // Render hook (simulating return to index page)
      renderHook(() => useScrollPosition());
      
      // Run initial delay timer (100ms in implementation)
      vi.advanceTimersByTime(100);
      
      // Verify window was scrolled to saved position
      expect(window.scrollTo).toHaveBeenCalledWith(0, 150);
    });
  });
}); 