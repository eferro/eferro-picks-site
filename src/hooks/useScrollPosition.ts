import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SCROLL_INDEX_KEY = 'scroll_index';

/**
 * Hook to save and restore scroll position for routes
 */
export function useScrollPosition() {
  const location = useLocation();
  const isIndex = location.pathname.endsWith('/');
  
  useEffect(() => {
    console.log('useScrollPosition mounted for path:', location.pathname);
    
    const saveScrollPosition = () => {
      const scrollY = window.scrollY;
      sessionStorage.setItem(SCROLL_INDEX_KEY, scrollY.toString());
      console.log('Saved index scroll position:', { 
        scrollY,
        timestamp: new Date().toISOString()
      });
    };

    const restoreScrollPosition = () => {
      const savedPosition = sessionStorage.getItem(SCROLL_INDEX_KEY);
      
      if (savedPosition !== null) {
        const targetScroll = parseInt(savedPosition, 10);
        console.log('Attempting to restore index scroll position:', {
          position: targetScroll,
          timestamp: new Date().toISOString()
        });

        // Try multiple times with increasing delays
        let attempts = 0;
        const maxAttempts = 10;
        
        const attemptScroll = () => {
          if (attempts >= maxAttempts) return;
          
          window.scrollTo(0, targetScroll);
          
          // Check if we reached the target
          if (Math.abs(window.scrollY - targetScroll) > 10) {
            attempts++;
            // Exponential backoff for retry delays
            setTimeout(attemptScroll, Math.min(100 * Math.pow(2, attempts), 2000));
          }
        };

        // Initial delay to let React render
        setTimeout(attemptScroll, 100);
      }
    };

    // Save scroll position on scroll (debounced)
    let scrollTimeout: number | null = null;
    const handleScroll = () => {
      if (scrollTimeout) {
        window.clearTimeout(scrollTimeout);
      }
      scrollTimeout = window.setTimeout(saveScrollPosition, 100);
    };

    // Add scroll listener only on index page
    if (isIndex) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // If we're on index page, restore position, otherwise scroll to top
    if (isIndex) {
      restoreScrollPosition();
    } else {
      window.scrollTo(0, 0);
    }

    // Cleanup
    return () => {
      if (scrollTimeout) {
        window.clearTimeout(scrollTimeout);
      }
      
      if (isIndex) {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [isIndex, location.pathname]);
} 