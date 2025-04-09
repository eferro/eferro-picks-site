import { AirtableItem } from '../../hooks/useTalks';

export const mockTalks: AirtableItem[] = [
  {
    airtable_id: 'test-1',
    Name: 'Test Talk',
    Url: 'https://example.com',
    Duration: 1800,
    Topics_Names: ['test'],
    Speakers_Names: ['Test Speaker'],
    Description: 'A test talk description',
    core_topic: 'test',
    Notes: 'Test notes',
    Language: 'English',
    Rating: 5,
    "Resource type": 'talk',
    year: 2024,
    conference_name: 'Test Conference'
  }
];

export const mockTalksWithEmptyNotes: AirtableItem[] = [
  {
    airtable_id: 'test-2',
    Name: 'Empty Notes Talk',
    Url: 'https://example.com/empty',
    Duration: 1800,
    Topics_Names: ['test'],
    Speakers_Names: ['Test Speaker'],
    Description: 'A talk with empty notes',
    core_topic: 'test',
    Notes: '   ', // Empty notes with whitespace
    Language: 'English',
    Rating: 5,
    "Resource type": 'talk',
    year: 2024,
    conference_name: 'Test Conference'
  }
];

export const mockTalksWithMixedLanguages: AirtableItem[] = [
  {
    airtable_id: 'test-1',
    Name: 'English Talk',
    Url: 'https://example.com',
    Duration: 1800,
    Topics_Names: ['test'],
    Speakers_Names: ['Test Speaker'],
    Description: 'An English talk',
    core_topic: 'test',
    Notes: 'Test notes',
    Language: 'English',
    Rating: 5,
    "Resource type": 'talk',
    year: 2024,
    conference_name: 'Test Conference'
  },
  {
    airtable_id: 'test-2',
    Name: 'Spanish Talk',
    Url: 'https://example.com/es',
    Duration: 1800,
    Topics_Names: ['test'],
    Speakers_Names: ['Test Speaker'],
    Description: 'A Spanish talk',
    core_topic: 'test',
    Notes: 'Test notes',
    Language: 'Spanish',
    Rating: 5,
    "Resource type": 'talk',
    year: 2024,
    conference_name: 'Test Conference'
  }
];

export const mockTalksWithMixedRatings: AirtableItem[] = [
  {
    airtable_id: 'test-1',
    Name: 'High Rating Talk',
    Url: 'https://example.com',
    Duration: 1800,
    Topics_Names: ['test'],
    Speakers_Names: ['Test Speaker'],
    Description: 'A high rating talk',
    core_topic: 'test',
    Notes: 'Test notes',
    Language: 'English',
    Rating: 5,
    "Resource type": 'talk',
    year: 2024,
    conference_name: 'Test Conference'
  },
  {
    airtable_id: 'test-2',
    Name: 'Low Rating Talk',
    Url: 'https://example.com/low',
    Duration: 1800,
    Topics_Names: ['test'],
    Speakers_Names: ['Test Speaker'],
    Description: 'A low rating talk',
    core_topic: 'test',
    Notes: 'Test notes',
    Language: 'English',
    Rating: 4,
    "Resource type": 'talk',
    year: 2024,
    conference_name: 'Test Conference'
  }
];

export const mockTalksWithMixedResourceTypes: AirtableItem[] = [
  {
    airtable_id: 'test-1',
    Name: 'Valid Talk',
    Url: 'https://example.com',
    Duration: 1800,
    Topics_Names: ['test'],
    Speakers_Names: ['Test Speaker'],
    Description: 'A valid talk',
    core_topic: 'test',
    Notes: 'Test notes',
    Language: 'English',
    Rating: 5,
    "Resource type": 'talk',
    year: 2024,
    conference_name: 'Test Conference'
  },
  {
    airtable_id: 'test-2',
    Name: 'Invalid Resource',
    Url: 'https://example.com/invalid',
    Duration: 1800,
    Topics_Names: ['test'],
    Speakers_Names: ['Test Speaker'],
    Description: 'An invalid resource',
    core_topic: 'test',
    Notes: 'Test notes',
    Language: 'English',
    Rating: 5,
    "Resource type": 'invalid',
    year: 2024,
    conference_name: 'Test Conference'
  }
];

export const mockTalksWithAllFields: AirtableItem[] = [
  {
    airtable_id: 'test-1',
    Name: 'Test Talk',
    Url: 'https://example.com',
    Duration: 1800,
    Topics_Names: ['test', 'example'],
    Speakers_Names: ['Speaker 1', 'Speaker 2'],
    Description: 'A test talk description',
    core_topic: 'test',
    Notes: 'Test notes',
    Language: 'English',
    Rating: 5,
    "Resource type": 'talk',
    year: 2024,
    conference_name: 'Test Conference'
  }
];

export const mockTalksWithMissingFields: AirtableItem[] = [
  {
    airtable_id: 'test-1',
    Name: 'Test Talk',
    Url: 'https://example.com',
    Language: 'English',
    Rating: 5,
    "Resource type": 'talk'
  }
]; 