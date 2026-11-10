import type { Talk } from '../types/talks';
import { normalizeText as normalizeForSearch } from './normalizeText';

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
