import { useState, useEffect } from 'react';
import { Talk } from '../types/talks';
import { processTalks } from '../utils/talks';

export interface AirtableItem {
  airtable_id: string;
  name: string;
  url: string;
  duration: number;
  topics_names: string[];
  speakers_names: string[];
  description: string;
  core_topic: string;
  notes?: string;
  language: string;
  rating: number;
  resource_type: string;
  year: number;
  conference_name: string;
  blog_url?: string;
}

/**
 * Configuration for fetch retry behavior.
 * Extracted to allow deterministic testing without duplicating retry logic.
 */
export interface FetchConfig {
  /** Maximum number of retry attempts */
  maxRetries: number;
  /** Base delay for retry attempts (ms) */
  retryDelayMs: number;
}

const DEFAULT_FETCH_CONFIG: FetchConfig = {
  maxRetries: 3,
  retryDelayMs: 1000 // 1 second, exponential backoff: 1s, 2s, 4s
};

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, config: FetchConfig): Promise<Response> {
  let lastError: Error;

  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('Unknown fetch error');

      if (attempt === config.maxRetries) {
        throw lastError;
      }

      // Exponential backoff: config.retryDelayMs * 2^(attempt-1)
      const delayMs = config.retryDelayMs * Math.pow(2, attempt - 1);
      await delay(delayMs);
    }
  }

  throw lastError!;
}

/**
 * Hook to fetch and process talks data.
 *
 * @param filterByRating - Whether to filter talks by rating
 * @param config - Optional fetch configuration (mainly for testing)
 */
export function useTalks(
  filterByRating: boolean = false,
  config: FetchConfig = DEFAULT_FETCH_CONFIG
) {
  const [talks, setTalks] = useState<Talk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadTalks = async () => {
      try {
        setError(null);
        const response = await fetchWithRetry(`${import.meta.env.BASE_URL}data/talks.json`, config);
        const data: AirtableItem[] = await response.json();

        if (!Array.isArray(data)) {
          throw new Error('Invalid data format: expected an array of talks');
        }

        const processedTalks = processTalks(data, filterByRating);
        setTalks(processedTalks);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(new Error(`Unable to load talks: ${errorMessage}. Please check your connection and try again.`));
      } finally {
        setLoading(false);
      }
    };

    loadTalks();
  }, [filterByRating, config]);

  return { talks, loading, error };
} 