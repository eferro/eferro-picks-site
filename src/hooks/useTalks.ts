import { useState, useEffect } from 'react';
import { Talk } from '../types/talks';

export function useTalks() {
  const [talks, setTalks] = useState<Talk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadTalks = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/talks.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Map airtable_id to id
        const processedTalks = data.talks.map((talk: any) => ({
          ...talk,
          id: talk.airtable_id
        }));
        setTalks(processedTalks);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load talks'));
      } finally {
        setIsLoading(false);
      }
    };

    loadTalks();
  }, []);

  return { talks, isLoading, error };
} 