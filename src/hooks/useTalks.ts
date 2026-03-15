import { useState, useEffect } from 'react';
import { Talk } from '../types/talks';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, maxRetries: number = MAX_RETRIES): Promise<Response> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Unknown fetch error');
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delayMs = RETRY_DELAY * Math.pow(2, attempt - 1);
      await delay(delayMs);
    }
  }
  
  throw lastError!;
}

export function useTalks(filterByRating: boolean = false) {
  const [talks, setTalks] = useState<Talk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadTalks = async () => {
      try {
        setError(null);
        const response = await fetchWithRetry(`${import.meta.env.BASE_URL}data/talks.json`);
        const data: Talk[] = await response.json();

        if (!Array.isArray(data)) {
          throw new Error('Invalid data format: expected an array of talks');
        }

        // Apply rating filter if requested
        const filteredTalks = filterByRating
          ? data.filter(talk => talk.rating === 5)
          : data;

        setTalks(filteredTalks);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(new Error(`Unable to load talks: ${errorMessage}. Please check your connection and try again.`));
      } finally {
        setLoading(false);
      }
    };

    loadTalks();
  }, [filterByRating]);

  return { talks, loading, error };
} 