import { AirtableItem } from '../hooks/useTalks';
import { Talk } from '../types/talks';

const VALID_RESOURCE_TYPES = ['podcast', 'talk', 'videopodcast'];

/**
 * Check if a talk has meaningful notes (not just whitespace or newlines)
 * @param notes The notes string to check
 * @returns true if the notes contain meaningful content
 */
export function hasMeaningfulNotes(notes: string | undefined | null): boolean {
  if (!notes) return false;
  return notes.trim().length > 0;
}

export function transformAirtableItemToTalk(item: AirtableItem): Talk {
  const type = item.resource_type?.toLowerCase();
  let format: 'talk' | 'podcast' | 'article' = 'talk';
  if (type === 'podcast' || type === 'videopodcast') format = 'podcast';
  else if (type === 'article/paper') format = 'article';
  return {
    id: item.airtable_id,
    title: item.name,
    url: item.url,
    duration: item.duration || 0,
    topics: item.topics_names || [],
    speakers: item.speakers_names || [],
    description: item.description || '',
    core_topic: item.core_topic || '',
    notes: hasMeaningfulNotes(item.notes) ? item.notes : undefined,
    year: item.year,
    conference_name: item.conference_name,
    format
  };
}

export function filterTalks(items: AirtableItem[], filterByRating: boolean = false): AirtableItem[] {
  return items.filter(item => {
    // Filter by language (only English for now)
    if (item.language !== 'English') return false;

    // Filter by rating if enabled
    if (filterByRating && item.rating !== 5) return false;

    // Filter by resource type
    if (!item.resource_type || !VALID_RESOURCE_TYPES.includes(item.resource_type.toLowerCase())) {
      return false;
    }

    return true;
  });
}

export function processTalks(items: AirtableItem[], filterByRating: boolean = false): Talk[] {
  const filteredItems = filterTalks(items, filterByRating);
  return filteredItems.map(transformAirtableItemToTalk);
} 