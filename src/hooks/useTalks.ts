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
}

export function useTalks(filterByRating: boolean = false) {
  const [talks, setTalks] = useState<Talk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadTalks = async () => {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/talks.json`);
        if (!response.ok) {
          throw new Error('Failed to load talks');
        }
        const data: AirtableItem[] = await response.json();
        const processedTalks = processTalks(data, filterByRating);
        setTalks(processedTalks);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    loadTalks();
  }, [filterByRating]);

  return { talks, loading, error };
} 