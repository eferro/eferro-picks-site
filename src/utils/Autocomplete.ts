import type { Talk } from '../types/talks';

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
    const normalized = query.toLowerCase();
    return this.topics.filter(t => t.toLowerCase().includes(normalized));
  }

  autocompleteSpeakers(query: string): string[] {
    const normalized = query.toLowerCase();
    return this.speakers.filter(s => s.toLowerCase().includes(normalized));
  }
}
