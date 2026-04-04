import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const SCROLL_INDEX_KEY = 'scroll_index';

/**
 * Configuration for scroll position behavior.
 * Extracted to allow deterministic testing without duplicating timing logic.
 */
export interface ScrollConfig {
  /** Delay for debouncing scroll events (ms) */
  debounceMs: number;
  /** Initial delay before attempting scroll restoration (ms) */
  initialDelayMs: number;
  /** Base delay for retry attempts (ms) */
  retryDelayMs: number;
  /** Maximum retry attempts for scroll restoration */
  maxRetries: number;
  /** Maximum delay between retries (ms) */
  maxDelayMs: number;
}

const DEFAULT_SCROLL_CONFIG: ScrollConfig = {
  debounceMs: 100,
  initialDelayMs: 100,
  retryDelayMs: 100,
  maxRetries: 10,
  maxDelayMs: 2000,
};

function isValidScrollPosition(value: string | null): boolean {
  if (!value) return false;

  const trimmed = value.trim();
  if (!trimmed) return false;

  const parsed = Number(trimmed);
  if (isNaN(parsed)) return false;
  if (!isFinite(parsed)) return false;
  if (!Number.isInteger(parsed) || parsed < 0) return false;

  return true;
}

/**
 * Hook to save and restore scroll position.
 *
 * The position is persisted only on the index page and it is reset when
 * navigating to any other route.
 *
 * @param config - Optional timing configuration (mainly for testing)
 */
export const useScrollPosition = (config: ScrollConfig = DEFAULT_SCROLL_CONFIG) => {
  const location = useLocation();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const attemptRef = useRef(0);
  const isIndexPage = location.pathname === '/' || location.pathname === '';

  const saveScrollPosition = useCallback(() => {
    if (!isIndexPage) return;

    const scrollPosition = window.scrollY;
    sessionStorage.setItem(SCROLL_INDEX_KEY, scrollPosition.toString());
  }, [isIndexPage]);

  const restoreScrollPosition = useCallback(() => {
    if (!isIndexPage) return;

    const savedScrollPosition = sessionStorage.getItem(SCROLL_INDEX_KEY);
    if (!savedScrollPosition) return;

    if (!isValidScrollPosition(savedScrollPosition)) {
      sessionStorage.removeItem(SCROLL_INDEX_KEY);
      return;
    }

    const parsedScrollPosition = parseInt(savedScrollPosition, 10);

    // Initial scroll attempt
    window.scrollTo(0, parsedScrollPosition);

    // Start retry mechanism if needed
    attemptRef.current = 0;
    const checkScrollPosition = () => {
      if (window.scrollY === parsedScrollPosition) return;

      attemptRef.current++;
      if (attemptRef.current >= config.maxRetries) return;

      window.scrollTo(0, parsedScrollPosition);

      const backoffDelay = Math.min(
        config.retryDelayMs * Math.pow(2, attemptRef.current),
        config.maxDelayMs
      );
      retryTimeoutRef.current = setTimeout(checkScrollPosition, backoffDelay);
    };

    retryTimeoutRef.current = setTimeout(checkScrollPosition, config.retryDelayMs);
  }, [isIndexPage, config]);

  // Handle scroll events with debounce
  useEffect(() => {
    if (!isIndexPage) return;

    const handleScroll = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(saveScrollPosition, config.debounceMs);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isIndexPage, saveScrollPosition, config.debounceMs]);

  // Handle scroll restoration and reset
  useEffect(() => {
    if (isIndexPage) {
      // Initial delay before restoring scroll position
      timeoutRef.current = setTimeout(restoreScrollPosition, config.initialDelayMs);
    } else {
      // Immediate scroll to top for non-index pages
      window.scrollTo(0, 0);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [location.pathname, isIndexPage, restoreScrollPosition, config.initialDelayMs]);
};
