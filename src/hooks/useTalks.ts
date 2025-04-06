import { useState, useEffect } from 'react';
import { Talk } from '../types/talks';

interface AirtableItem {
  airtable_id: string;
  Name: string;
  Url: string;
  Duration?: number;
  Topics_Names?: string[];
  Speakers_Names?: string[];
  Description?: string;
  core_topic?: string;
  Notes?: string;
  Language?: string;
  Rating?: number;
  "Resource type"?: string;
  year?: number;
}

const VALID_RESOURCE_TYPES = ['podcast', 'talk', 'videopodcast'];

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
        
        const data = await response.json() as AirtableItem[];
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format: expected an array');
        }

        // Filter talks: only English, rating 5, and valid resource types
        const filteredData = data.filter(item => 
          item.Language === 'English' && 
          item.Rating === 5 &&
          item["Resource type"] && 
          VALID_RESOURCE_TYPES.includes(item["Resource type"].toLowerCase())
        );

        const processedTalks = filteredData.map(item => {
          if (!item.airtable_id) {
            throw new Error(`Talk missing airtable_id: ${item.Name || 'unknown'}`);
          }
          return {
            id: item.airtable_id,
            title: item.Name,
            url: item.Url,
            duration: item.Duration || 0,
            topics: item.Topics_Names || [],
            speakers: item.Speakers_Names || [],
            description: item.Description || '',
            core_topic: item.core_topic || '',
            notes: item.Notes,
            year: item.year
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