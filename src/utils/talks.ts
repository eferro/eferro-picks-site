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
  return {
    id: item.airtable_id,
    title: item.Name,
    url: item.Url,
    duration: item.Duration || 0,
    topics: item.Topics_Names || [],
    speakers: item.Speakers_Names || [],
    description: item.Description || '',
    core_topic: item.core_topic || '',
    notes: hasMeaningfulNotes(item.Notes) ? item.Notes : undefined,
    year: item.year,
    conference_name: item.conference_name
  };
}

export function filterTalks(items: AirtableItem[]): AirtableItem[] {
  return items.filter(item => {
    // Filter by language (only English for now)
    if (item.Language !== 'English') return false;

    // Filter by rating (only high for now)
    if (item.Rating !== 5) return false;

    // Filter by resource type
    if (!item["Resource type"] || !VALID_RESOURCE_TYPES.includes(item["Resource type"].toLowerCase())) {
      return false;
    }

    return true;
  });
}

export function processTalks(items: AirtableItem[]): Talk[] {
  const filteredItems = filterTalks(items);
  return filteredItems.map(transformAirtableItemToTalk);
} 