import { useState, useEffect } from 'react';
import { Talk } from '../types/talks';

interface AirtableResponse {
  talks: Array<{
    airtable_id: string;
    title: string;
    url: string;
    duration: number;
    topics: string[];
    speakers: string[];
    description: string;
    core_topic: string;
  }>;
}

export function useTalks() {
  const [talks, setTalks] = useState<Talk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadTalks = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/talks.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json() as AirtableResponse;
        
        if (!data.talks || !Array.isArray(data.talks)) {
          throw new Error('Invalid data format: talks array not found');
        }

        const processedTalks = data.talks.map(talk => {
          if (!talk.airtable_id) {
            throw new Error(`Talk missing airtable_id: ${talk.title || 'unknown'}`);
          }
          return {
            ...talk,
            id: talk.airtable_id
          };
        });

        setTalks(processedTalks);
      } catch (err) {
        console.error('Error loading talks:', err);
        setError(err instanceof Error ? err : new Error('Failed to load talks'));
      } finally {
        setLoading(false);
      }
    };

    loadTalks();
  }, []);

  return { talks, loading, error };
} 