import type { Talk } from '../types/talks';

/**
 * Normalizes text for accent-insensitive comparison.
 * Uses NFD normalization to decompose accented characters,
 * then removes combining diacritical marks.
 */
function normalizeForSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export interface Suggestion {
  type: 'speaker' | 'topic';
  value: string;
  label: string;
}

/**
 * Get unified suggestions for speakers and topics matching the query.
 * Returns speakers first, then topics, up to maxSuggestions.
 */
export function getSuggestions(
  talks: Talk[],
  query: string,
  maxSuggestions: number = 10
): Suggestion[] {
  if (!query.trim()) return [];

  const normalizedQuery = normalizeForSearch(query);
  const speakerSet = new Set<string>();
  const topicSet = new Set<string>();

  talks.forEach(talk => {
    talk.speakers?.forEach(s => speakerSet.add(s));
    talk.topics?.forEach(t => topicSet.add(t));
  });

  const matchingSpeakers = Array.from(speakerSet)
    .filter(s => normalizeForSearch(s).includes(normalizedQuery))
    .map(s => ({ type: 'speaker' as const, value: s, label: s }));

  const matchingTopics = Array.from(topicSet)
    .filter(t => normalizeForSearch(t).includes(normalizedQuery))
    .map(t => ({ type: 'topic' as const, value: t, label: t }));

  return [...matchingSpeakers, ...matchingTopics].slice(0, maxSuggestions);
}

// Legacy class for backward compatibility during migration
export class Autocomplete {
  private topics: string[];
  private speakers: string[];

  constructor(talks: Talk[]) {
    const topicSet = new Set<string>();
    const speakerSet = new Set<string>();

    for (const talk of talks) {
      for (const topic of talk.topics) {
        topicSet.add(topic);
      }
      for (const speaker of talk.speakers) {
        speakerSet.add(speaker);
      }
    }

    this.topics = Array.from(topicSet).sort();
    this.speakers = Array.from(speakerSet).sort();
  }

  autocompleteTopics(query: string): string[] {
    const normalized = normalizeForSearch(query);
    return this.topics.filter(t => normalizeForSearch(t).includes(normalized));
  }

  autocompleteSpeakers(query: string): string[] {
    const normalized = normalizeForSearch(query);
    return this.speakers.filter(s => normalizeForSearch(s).includes(normalized));
  }
}
