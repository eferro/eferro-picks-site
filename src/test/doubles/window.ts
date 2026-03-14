/**
 * Window Test Double
 *
 * Provides a controlled, deterministic window object for testing.
 * Eliminates the need to manipulate global window state directly.
 *
 * WHY: Direct window manipulation in tests:
 * - Creates implicit dependencies between tests
 * - Makes tests harder to understand (lots of Object.defineProperty)
 * - Can cause flaky tests if cleanup is incomplete
 *
 * USAGE:
 * ```typescript
 * const mockWindow = createWindowDouble({
 *   scrollBehavior: 'partial' // Simulates incomplete scroll
 * });
 * // Inject into component or hook (requires production code change)
 * ```
 */

export type ScrollBehavior = 'instant' | 'delayed' | 'partial';

export interface WindowDoubleOptions {
  /** Initial scroll position */
  initialScrollY?: number;
  /** How scrollTo behaves */
  scrollBehavior?: ScrollBehavior;
  /** Delay for 'delayed' scroll behavior (ms) */
  scrollDelayMs?: number;
  /** Offset for 'partial' scroll behavior (px) */
  scrollOffset?: number;
}

export interface WindowDouble {
  /** Current scroll position */
  scrollY: number;
  /** Scroll to a position */
  scrollTo(x: number, y: number): void;
  /** Add event listener */
  addEventListener(event: string, handler: EventListener): void;
  /** Remove event listener */
  removeEventListener(event: string, handler: EventListener): void;
  /** Dispatch event */
  dispatchEvent(event: Event): boolean;
  /** Session storage mock */
  sessionStorage: Storage;
}

/**
 * Creates a test double for the window object.
 *
 * @param options - Configuration for window behavior
 * @returns A controllable window object for testing
 *
 * @example
 * ```typescript
 * // Test instant scroll (default)
 * const mockWindow = createWindowDouble();
 * mockWindow.scrollTo(0, 100);
 * expect(mockWindow.scrollY).toBe(100);
 *
 * // Test partial scroll (DOM not ready)
 * const partialWindow = createWindowDouble({
 *   scrollBehavior: 'partial',
 *   scrollOffset: 20
 * });
 * partialWindow.scrollTo(0, 500);
 * expect(partialWindow.scrollY).toBe(480); // 500 - 20
 *
 * // Test delayed scroll (async rendering)
 * const delayedWindow = createWindowDouble({
 *   scrollBehavior: 'delayed',
 *   scrollDelayMs: 50
 * });
 * delayedWindow.scrollTo(0, 200);
 * // After 50ms delay, scrollY becomes 200
 * ```
 */
export function createWindowDouble(options: WindowDoubleOptions = {}): WindowDouble {
  const {
    initialScrollY = 0,
    scrollBehavior = 'instant',
    scrollDelayMs = 50,
    scrollOffset = 20
  } = options;

  let scrollY = initialScrollY;
  const listeners = new Map<string, Set<EventListener>>();
  const storage = new Map<string, string>();

  const windowDouble: WindowDouble = {
    get scrollY() {
      return scrollY;
    },

    scrollTo(x: number, y: number) {
      switch (scrollBehavior) {
        case 'instant':
          // Normal scroll - reaches target immediately
          scrollY = y;
          break;

        case 'partial':
          // Simulate scroll not reaching target (DOM not ready)
          scrollY = Math.max(0, y - scrollOffset);
          break;

        case 'delayed':
          // Simulate async scroll (requires setTimeout in test)
          setTimeout(() => {
            scrollY = y;
          }, scrollDelayMs);
          break;
      }
    },

    addEventListener(event: string, handler: EventListener) {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)!.add(handler);
    },

    removeEventListener(event: string, handler: EventListener) {
      listeners.get(event)?.delete(handler);
    },

    dispatchEvent(event: Event): boolean {
      const eventListeners = listeners.get(event.type);
      if (eventListeners) {
        eventListeners.forEach(handler => handler(event));
        return true;
      }
      return false;
    },

    sessionStorage: {
      getItem(key: string): string | null {
        return storage.get(key) ?? null;
      },
      setItem(key: string, value: string): void {
        storage.set(key, value);
      },
      removeItem(key: string): void {
        storage.delete(key);
      },
      clear(): void {
        storage.clear();
      },
      key(index: number): string | null {
        return Array.from(storage.keys())[index] ?? null;
      },
      get length(): number {
        return storage.size;
      }
    }
  };

  return windowDouble;
}

/**
 * Helper to create a spy-able window double with Vitest.
 *
 * @param vi - Vitest's vi object for creating spies
 * @param options - Configuration for window behavior
 * @returns A window double with spied methods
 *
 * @example
 * ```typescript
 * import { vi } from 'vitest';
 *
 * const spiedWindow = createSpiedWindowDouble(vi);
 * // ... use in test
 * expect(spiedWindow.scrollTo).toHaveBeenCalledWith(0, 100);
 * ```
 */
export function createSpiedWindowDouble(
  vi: { fn: <T extends (...args: unknown[]) => unknown>(implementation?: T) => T },
  options: WindowDoubleOptions = {}
): WindowDouble & {
  scrollTo: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
  removeEventListener: ReturnType<typeof vi.fn>;
} {
  const windowDouble = createWindowDouble(options);

  // Create spies that delegate to the original implementation
  const scrollToSpy = vi.fn((x: number, y: number) => windowDouble.scrollTo(x, y));
  const addEventListenerSpy = vi.fn((event: string, handler: EventListener) =>
    windowDouble.addEventListener(event, handler)
  );
  const removeEventListenerSpy = vi.fn((event: string, handler: EventListener) =>
    windowDouble.removeEventListener(event, handler)
  );

  return {
    get scrollY() {
      return windowDouble.scrollY;
    },
    scrollTo: scrollToSpy,
    addEventListener: addEventListenerSpy,
    removeEventListener: removeEventListenerSpy,
    dispatchEvent: windowDouble.dispatchEvent.bind(windowDouble),
    sessionStorage: windowDouble.sessionStorage
  };
}
