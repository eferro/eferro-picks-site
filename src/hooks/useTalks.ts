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
        setTalks(data.talks);
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