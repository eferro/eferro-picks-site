import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createWindowDouble, createSpiedWindowDouble } from './window';

describe('Window Test Double', () => {
  describe('createWindowDouble', () => {
    describe('scroll behavior', () => {
      it('scrolls instantly by default', () => {
        const mockWindow = createWindowDouble();

        expect(mockWindow.scrollY).toBe(0);

        mockWindow.scrollTo(0, 100);
        expect(mockWindow.scrollY).toBe(100);

        mockWindow.scrollTo(0, 500);
        expect(mockWindow.scrollY).toBe(500);
      });

      it('supports initial scroll position', () => {
        const mockWindow = createWindowDouble({
          initialScrollY: 250
        });

        expect(mockWindow.scrollY).toBe(250);
      });

      it('simulates partial scroll (DOM not ready)', () => {
        const mockWindow = createWindowDouble({
          scrollBehavior: 'partial',
          scrollOffset: 20
        });

        mockWindow.scrollTo(0, 500);
        expect(mockWindow.scrollY).toBe(480); // 500 - 20

        mockWindow.scrollTo(0, 100);
        expect(mockWindow.scrollY).toBe(80); // 100 - 20
      });

      it('prevents negative scroll with partial behavior', () => {
        const mockWindow = createWindowDouble({
          scrollBehavior: 'partial',
          scrollOffset: 50
        });

        mockWindow.scrollTo(0, 30);
        expect(mockWindow.scrollY).toBe(0); // Math.max(0, 30 - 50) = 0
      });

      it('simulates delayed scroll (async rendering)', () => {
        vi.useFakeTimers();

        const mockWindow = createWindowDouble({
          scrollBehavior: 'delayed',
          scrollDelayMs: 50
        });

        mockWindow.scrollTo(0, 200);
        expect(mockWindow.scrollY).toBe(0); // Not scrolled yet

        vi.advanceTimersByTime(50);
        expect(mockWindow.scrollY).toBe(200); // Scrolled after delay

        vi.useRealTimers();
      });
    });

    describe('event listeners', () => {
      it('adds and triggers event listeners', () => {
        const mockWindow = createWindowDouble();
        const handler = vi.fn();

        mockWindow.addEventListener('scroll', handler);

        const event = new Event('scroll');
        mockWindow.dispatchEvent(event);

        expect(handler).toHaveBeenCalledWith(event);
        expect(handler).toHaveBeenCalledTimes(1);
      });

      it('supports multiple event listeners', () => {
        const mockWindow = createWindowDouble();
        const handler1 = vi.fn();
        const handler2 = vi.fn();

        mockWindow.addEventListener('scroll', handler1);
        mockWindow.addEventListener('scroll', handler2);

        const event = new Event('scroll');
        mockWindow.dispatchEvent(event);

        expect(handler1).toHaveBeenCalledOnce();
        expect(handler2).toHaveBeenCalledOnce();
      });

      it('removes event listeners', () => {
        const mockWindow = createWindowDouble();
        const handler = vi.fn();

        mockWindow.addEventListener('scroll', handler);
        mockWindow.removeEventListener('scroll', handler);

        const event = new Event('scroll');
        mockWindow.dispatchEvent(event);

        expect(handler).not.toHaveBeenCalled();
      });

      it('handles different event types', () => {
        const mockWindow = createWindowDouble();
        const scrollHandler = vi.fn();
        const clickHandler = vi.fn();

        mockWindow.addEventListener('scroll', scrollHandler);
        mockWindow.addEventListener('click', clickHandler);

        mockWindow.dispatchEvent(new Event('scroll'));
        expect(scrollHandler).toHaveBeenCalledOnce();
        expect(clickHandler).not.toHaveBeenCalled();

        mockWindow.dispatchEvent(new Event('click'));
        expect(scrollHandler).toHaveBeenCalledOnce();
        expect(clickHandler).toHaveBeenCalledOnce();
      });
    });

    describe('sessionStorage', () => {
      let mockWindow: ReturnType<typeof createWindowDouble>;

      beforeEach(() => {
        mockWindow = createWindowDouble();
      });

      it('stores and retrieves items', () => {
        mockWindow.sessionStorage.setItem('key', 'value');
        expect(mockWindow.sessionStorage.getItem('key')).toBe('value');
      });

      it('returns null for non-existent keys', () => {
        expect(mockWindow.sessionStorage.getItem('nonexistent')).toBeNull();
      });

      it('removes items', () => {
        mockWindow.sessionStorage.setItem('key', 'value');
        mockWindow.sessionStorage.removeItem('key');
        expect(mockWindow.sessionStorage.getItem('key')).toBeNull();
      });

      it('clears all items', () => {
        mockWindow.sessionStorage.setItem('key1', 'value1');
        mockWindow.sessionStorage.setItem('key2', 'value2');

        mockWindow.sessionStorage.clear();

        expect(mockWindow.sessionStorage.getItem('key1')).toBeNull();
        expect(mockWindow.sessionStorage.getItem('key2')).toBeNull();
      });

      it('tracks length', () => {
        expect(mockWindow.sessionStorage.length).toBe(0);

        mockWindow.sessionStorage.setItem('key1', 'value1');
        expect(mockWindow.sessionStorage.length).toBe(1);

        mockWindow.sessionStorage.setItem('key2', 'value2');
        expect(mockWindow.sessionStorage.length).toBe(2);

        mockWindow.sessionStorage.removeItem('key1');
        expect(mockWindow.sessionStorage.length).toBe(1);
      });

      it('supports key() method', () => {
        mockWindow.sessionStorage.setItem('first', 'value1');
        mockWindow.sessionStorage.setItem('second', 'value2');

        const keys = [
          mockWindow.sessionStorage.key(0),
          mockWindow.sessionStorage.key(1)
        ];

        expect(keys).toContain('first');
        expect(keys).toContain('second');
        expect(mockWindow.sessionStorage.key(2)).toBeNull();
      });
    });
  });

  describe('createSpiedWindowDouble', () => {
    it('creates a window double with spied methods', () => {
      const spiedWindow = createSpiedWindowDouble(vi);

      spiedWindow.scrollTo(0, 100);
      expect(spiedWindow.scrollTo).toHaveBeenCalledWith(0, 100);
      expect(spiedWindow.scrollTo).toHaveBeenCalledTimes(1);
    });

    it('spies on addEventListener', () => {
      const spiedWindow = createSpiedWindowDouble(vi);
      const handler = vi.fn();

      spiedWindow.addEventListener('scroll', handler);

      expect(spiedWindow.addEventListener).toHaveBeenCalledWith('scroll', handler);
      expect(spiedWindow.addEventListener).toHaveBeenCalledTimes(1);
    });

    it('spies on removeEventListener', () => {
      const spiedWindow = createSpiedWindowDouble(vi);
      const handler = vi.fn();

      spiedWindow.addEventListener('scroll', handler);
      spiedWindow.removeEventListener('scroll', handler);

      expect(spiedWindow.removeEventListener).toHaveBeenCalledWith('scroll', handler);
    });

    it('maintains behavior while spying', () => {
      const spiedWindow = createSpiedWindowDouble(vi, {
        scrollBehavior: 'partial',
        scrollOffset: 20
      });

      spiedWindow.scrollTo(0, 500);

      expect(spiedWindow.scrollTo).toHaveBeenCalledWith(0, 500);
      expect(spiedWindow.scrollY).toBe(480); // Behavior still works
    });
  });

  describe('Real-world scenarios', () => {
    it('simulates scroll restoration with partial scroll', () => {
      /**
       * CONTEXT: This simulates the real scenario where scroll restoration
       * fails because the DOM hasn't fully loaded yet.
       */
      const mockWindow = createWindowDouble({
        scrollBehavior: 'partial',
        scrollOffset: 20
      });

      const savedPosition = 500;

      // First attempt - partial scroll
      mockWindow.scrollTo(0, savedPosition);
      expect(mockWindow.scrollY).toBe(480);

      // Retry after DOM loads - switch to instant
      const readyWindow = createWindowDouble({
        initialScrollY: mockWindow.scrollY,
        scrollBehavior: 'instant'
      });

      readyWindow.scrollTo(0, savedPosition);
      expect(readyWindow.scrollY).toBe(500); // Success!
    });

    it('simulates debounced scroll events', () => {
      const mockWindow = createWindowDouble();
      const handler = vi.fn();

      mockWindow.addEventListener('scroll', handler);

      // Simulate rapid scrolling
      mockWindow.scrollTo(0, 100);
      mockWindow.dispatchEvent(new Event('scroll'));

      mockWindow.scrollTo(0, 200);
      mockWindow.dispatchEvent(new Event('scroll'));

      mockWindow.scrollTo(0, 300);
      mockWindow.dispatchEvent(new Event('scroll'));

      // Handler called for each scroll event
      expect(handler).toHaveBeenCalledTimes(3);
    });
  });
});
