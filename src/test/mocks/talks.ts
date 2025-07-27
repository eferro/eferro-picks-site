import { AirtableItem } from '../../hooks/useTalks';

export const mockTalks: AirtableItem[] = [
  {
    airtable_id: 'test-1',
    name: 'Test Talk',
    url: 'https://example.com',
    duration: 1800,
    topics_names: ['test'],
    speakers_names: ['Test Speaker'],
    description: 'A test talk description',
    core_topic: 'test',
    notes: 'Test notes',
    language: 'English',
    rating: 5,
    resource_type: 'talk',
    year: 2024,
    conference_name: 'Test Conference'
  }
];

export const mockTalksWithEmptyNotes: AirtableItem[] = [
  {
    airtable_id: 'test-2',
    name: 'Empty Notes Talk',
    url: 'https://example.com/empty',
    duration: 1800,
    topics_names: ['test'],
    speakers_names: ['Test Speaker'],
    description: 'A talk with empty notes',
    core_topic: 'test',
    notes: '   ', // Empty notes with whitespace
    language: 'English',
    rating: 5,
    resource_type: 'talk',
    year: 2024,
    conference_name: 'Test Conference'
  }
];

export const mockTalksWithMixedLanguages: AirtableItem[] = [
  {
    airtable_id: 'test-1',
    name: 'English Talk',
    url: 'https://example.com',
    duration: 1800,
    topics_names: ['test'],
    speakers_names: ['Test Speaker'],
    description: 'An English talk',
    core_topic: 'test',
    notes: 'Test notes',
    language: 'English',
    rating: 5,
    resource_type: 'talk',
    year: 2024,
    conference_name: 'Test Conference'
  },
  {
    airtable_id: 'test-2',
    name: 'Spanish Talk',
    url: 'https://example.com/es',
    duration: 1800,
    topics_names: ['test'],
    speakers_names: ['Test Speaker'],
    description: 'A Spanish talk',
    core_topic: 'test',
    notes: 'Test notes',
    language: 'Spanish',
    rating: 5,
    resource_type: 'talk',
    year: 2024,
    conference_name: 'Test Conference'
  }
];

export const mockTalksWithMixedRatings: AirtableItem[] = [
  {
    airtable_id: 'test-1',
    name: 'High Rating Talk',
    url: 'https://example.com',
    duration: 1800,
    topics_names: ['test'],
    speakers_names: ['Test Speaker'],
    description: 'A high rating talk',
    core_topic: 'test',
    notes: 'Test notes',
    language: 'English',
    rating: 5,
    resource_type: 'talk',
    year: 2024,
    conference_name: 'Test Conference'
  },
  {
    airtable_id: 'test-2',
    name: 'Low Rating Talk',
    url: 'https://example.com/low',
    duration: 1800,
    topics_names: ['test'],
    speakers_names: ['Test Speaker'],
    description: 'A low rating talk',
    core_topic: 'test',
    notes: 'Test notes',
    language: 'English',
    rating: 4,
    resource_type: 'talk',
    year: 2024,
    conference_name: 'Test Conference'
  }
];

export const mockTalksWithMixedResourceTypes: AirtableItem[] = [
  {
    airtable_id: 'test-1',
    name: 'Valid Talk',
    url: 'https://example.com',
    duration: 1800,
    topics_names: ['test'],
    speakers_names: ['Test Speaker'],
    description: 'A valid talk',
    core_topic: 'test',
    notes: 'Test notes',
    language: 'English',
    rating: 5,
    resource_type: 'talk',
    year: 2024,
    conference_name: 'Test Conference'
  },
  {
    airtable_id: 'test-2',
    name: 'Invalid Resource',
    url: 'https://example.com/invalid',
    duration: 1800,
    topics_names: ['test'],
    speakers_names: ['Test Speaker'],
    description: 'An invalid resource',
    core_topic: 'test',
    notes: 'Test notes',
    language: 'English',
    rating: 5,
    resource_type: 'invalid',
    year: 2024,
    conference_name: 'Test Conference'
  }
];

export const mockTalksWithAllFields: AirtableItem[] = [
  {
    airtable_id: 'test-1',
    name: 'Test Talk',
    url: 'https://example.com',
    duration: 1800,
    topics_names: ['test', 'example'],
    speakers_names: ['Speaker 1', 'Speaker 2'],
    description: 'A test talk description',
    core_topic: 'test',
    notes: 'Test notes',
    language: 'English',
    rating: 5,
    resource_type: 'talk',
    year: 2024,
    conference_name: 'Test Conference'
  }
];

export const mockTalksWithMissingFields: AirtableItem[] = [
  {
    airtable_id: 'test-1',
    name: 'Test Talk',
    url: 'https://example.com',
    language: 'English',
    rating: 5,
    resource_type: 'talk'
  }
];