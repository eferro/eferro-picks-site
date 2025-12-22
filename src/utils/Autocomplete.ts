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
