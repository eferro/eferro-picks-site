import { Talk } from '../../types/talks';

export const mockTalks: Talk[] = [
  {
    id: 'test-1',
    title: 'Test Talk',
    url: 'https://example.com',
    duration: 1800,
    topics: ['test'],
    speakers: ['Test Speaker'],
    description: 'A test talk description',
    core_topic: 'test',
    notes: 'Test notes',
    rating: 5,
    format: 'talk',
    year: 2024,
    conference_name: 'Test Conference'
  }
];

export const mockTalksWithEmptyNotes: Talk[] = [
  {
    id: 'test-2',
    title: 'Empty Notes Talk',
    url: 'https://example.com/empty',
    duration: 1800,
    topics: ['test'],
    speakers: ['Test Speaker'],
    description: 'A talk with empty notes',
    core_topic: 'test',
    notes: undefined, // Empty notes are now undefined after processing
    rating: 5,
    format: 'talk',
    year: 2024,
    conference_name: 'Test Conference'
  }
];

export const mockTalksWithMixedLanguages: Talk[] = [
  {
    id: 'test-1',
    title: 'English Talk',
    url: 'https://example.com',
    duration: 1800,
    topics: ['test'],
    speakers: ['Test Speaker'],
    description: 'An English talk',
    core_topic: 'test',
    notes: 'Test notes',
    rating: 5,
    format: 'talk',
    year: 2024,
    conference_name: 'Test Conference'
  }
  // Spanish talk would be filtered out during data loading, so only English talk remains
];

export const mockTalksWithMixedRatings: Talk[] = [
  {
    id: 'test-1',
    title: 'High Rating Talk',
    url: 'https://example.com',
    duration: 1800,
    topics: ['test'],
    speakers: ['Test Speaker'],
    description: 'A high rating talk',
    core_topic: 'test',
    notes: 'Test notes',
    rating: 5,
    format: 'talk',
    year: 2024,
    conference_name: 'Test Conference'
  },
  {
    id: 'test-2',
    title: 'Low Rating Talk',
    url: 'https://example.com/low',
    duration: 1800,
    topics: ['test'],
    speakers: ['Test Speaker'],
    description: 'A low rating talk',
    core_topic: 'test',
    notes: 'Test notes',
    rating: 4,
    format: 'talk',
    year: 2024,
    conference_name: 'Test Conference'
  }
];

export const mockTalksWithMixedResourceTypes: Talk[] = [
  {
    id: 'test-1',
    title: 'Valid Talk',
    url: 'https://example.com',
    duration: 1800,
    topics: ['test'],
    speakers: ['Test Speaker'],
    description: 'A valid talk',
    core_topic: 'test',
    notes: 'Test notes',
    rating: 5,
    format: 'talk',
    year: 2024,
    conference_name: 'Test Conference'
  }
  // Invalid resource would be filtered out during data loading
];

export const mockTalksWithAllFields: Talk[] = [
  {
    id: 'test-1',
    title: 'Test Talk',
    url: 'https://example.com',
    duration: 1800,
    topics: ['test', 'example'],
    speakers: ['Speaker 1', 'Speaker 2'],
    description: 'A test talk description',
    core_topic: 'test',
    notes: 'Test notes',
    rating: 5,
    format: 'talk',
    year: 2024,
    conference_name: 'Test Conference'
  }
];

export const mockTalksWithMissingFields: Talk[] = [
  {
    id: 'test-1',
    title: 'Test Talk',
    url: 'https://example.com',
    duration: 0,
    topics: [],
    speakers: [],
    description: '',
    core_topic: '',
    rating: 5,
    format: 'talk'
  }
];