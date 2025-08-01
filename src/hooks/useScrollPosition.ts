import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const SCROLL_INDEX_KEY = 'scroll_index';
const DEBOUNCE_DELAY = 100;
const INITIAL_DELAY = 100;
const MAX_ATTEMPTS = 10;
const MAX_DELAY = 2000;

/**
 * Hook to save and restore scroll position.
 *
 * The position is persisted only on the index page and it is reset when
 * navigating to any other route.
 */
export const useScrollPosition = () => {
  const location = useLocation();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const attemptRef = useRef(0);
  const isIndexPage = location.pathname === '/' || location.pathname === '';

  const saveScrollPosition = useCallback(() => {
    if (!isIndexPage) return;
    
    const scrollPosition = window.scrollY;
    sessionStorage.setItem(SCROLL_INDEX_KEY, scrollPosition.toString());
  }, [isIndexPage]);

  const isValidScrollPosition = (value: string | null): boolean => {
    if (!value) return false;
    
    // Trim whitespace
    const trimmed = value.trim();
    if (!trimmed) return false;
    
    // Parse as number
    const parsed = Number(trimmed);
    
    // Check if it's a valid number
    if (isNaN(parsed)) return false;
    
    // Check if it's finite
    if (!isFinite(parsed)) return false;
    
    // Check if it's a non-negative integer
    if (!Number.isInteger(parsed) || parsed < 0) return false;
    
    return true;
  };

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
      if (attemptRef.current >= MAX_ATTEMPTS) return;
      
      window.scrollTo(0, parsedScrollPosition);
      
      const backoffDelay = Math.min(100 * Math.pow(2, attemptRef.current), MAX_DELAY);
      retryTimeoutRef.current = setTimeout(checkScrollPosition, backoffDelay);
    };
    
    retryTimeoutRef.current = setTimeout(checkScrollPosition, 100);
  }, [isIndexPage]);

  // Handle scroll events with debounce
  useEffect(() => {
    if (!isIndexPage) return;

    const handleScroll = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(saveScrollPosition, DEBOUNCE_DELAY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isIndexPage, saveScrollPosition]);

  // Handle scroll restoration and reset
  useEffect(() => {
    if (isIndexPage) {
      // Initial delay before restoring scroll position
      timeoutRef.current = setTimeout(restoreScrollPosition, INITIAL_DELAY);
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
  }, [location.pathname, isIndexPage, restoreScrollPosition]);
}; 