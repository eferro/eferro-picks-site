import { Talk } from "../types/talks";
import { hasMeaningfulNotes } from "./talks";

/**
 * Normalizes text for search: lowercase and removes accents
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Searches for query terms in multiple talk fields (title, description, speakers, topics, notes)
 * All terms must match (AND logic) in any combination of fields
 */
function searchInFields(talk: Talk, query: string): boolean {
  if (!query.trim()) return true;

  const searchTerms = query.trim().split(/\s+/).map(normalizeText);
  const searchableText = normalizeText([
    talk.title,
    talk.description || '',
    ...(talk.speakers || []),
    ...(talk.topics || []),
    talk.notes || ''
  ].join(' '));

  return searchTerms.every(term => searchableText.includes(term));
}

export interface TalksFilterData {
  year?: number | null;
  yearType?: 'specific' | 'before' | 'after' | 'last2' | 'last5' | null;
  author?: string | null;
  topics?: string[];
  conference?: string | null;
  hasNotes?: boolean;
  rating?: number | null;
  query?: string;
  formats?: string[];
  _testCurrentYear?: number; // For deterministic testing - injects "now"
}

export class TalksFilter {
  readonly year: number | null;
  readonly yearType: 'specific' | 'before' | 'after' | 'last2' | 'last5' | null;
  readonly author: string | null;
  readonly topics: string[];
  readonly conference: string | null;
  readonly hasNotes: boolean;
  readonly rating: number | null;
  readonly query: string;
  readonly formats: string[];
  private readonly _testCurrentYear?: number;

  constructor({
    year = null,
    yearType = null,
    author = null,
    topics = [],
    conference = null,
    hasNotes = false,
    rating = null,
    query = '',
    formats = [],
    _testCurrentYear,
  }: TalksFilterData = {}) {
    this.year = year;
    this.yearType = yearType;
    this.author = author;
    this.topics = topics;
    this.conference = conference;
    this.hasNotes = hasNotes;
    this.rating = rating;
    this.query = query || '';
    this.formats = formats;
    this._testCurrentYear = _testCurrentYear;
  }

  private matchesYear(talk: Talk): boolean {
    const currentYear = this._testCurrentYear ?? new Date().getFullYear();
    const effectiveYearType = this.yearType || (this.year != null ? 'specific' : null);
    switch (effectiveYearType) {
      case 'last2':
        return talk.year != null && talk.year >= currentYear - 2;
      case 'last5':
        return talk.year != null && talk.year >= currentYear - 5;
      case 'before':
        return this.year != null ? (talk.year != null && talk.year < this.year) : true;
      case 'after':
        return this.year != null ? (talk.year != null && talk.year > this.year) : true;
      case 'specific':
        return this.year != null ? (talk.year != null && talk.year === this.year) : true;
      default:
        return true;
    }
  }

  toParams(): string {
    const params = new URLSearchParams();
    if (this.yearType) {
      params.set('yearType', this.yearType);
      if (this.yearType === 'specific' || this.yearType === 'before' || this.yearType === 'after') {
        if (this.year !== null) {
          params.set('year', this.year.toString());
        }
      }
    } else if (this.year) {
      // Backward compatibility: if only year is set, treat as specific
      params.set('yearType', 'specific');
      params.set('year', this.year.toString());
    }
    // No longer write author/topics - migrated to query
    if (this.conference) {
      params.set('conference', this.conference);
    }
    if (this.hasNotes) {
      params.set('hasNotes', 'true');
    }
    if (this.rating !== null) {
      params.set('rating', this.rating.toString());
    }
    if (this.query) {
      params.set('query', this.query);
    }
    if (this.formats.length > 0) {
      params.set('format', this.formats.join(','));
    }
    return params.toString();
  }

  filter(talks: Talk[]): Talk[] {
    return talks.filter(talk => {
      const yearMatch = this.matchesYear(talk);
      const queryMatch = searchInFields(talk, this.query);
      const authorMatch = !this.author || talk.speakers.includes(this.author);
      const topicsMatch =
        this.topics.length === 0 || this.topics.every(t => talk.topics.includes(t));
      const conferenceMatch = !this.conference || talk.conference_name === this.conference;
      const notesMatch = !this.hasNotes || hasMeaningfulNotes(talk.notes);
      const formatMatch =
        this.formats.length === 0 || this.formats.includes(talk.format ?? 'talk');
      return (
        yearMatch &&
        queryMatch &&
        authorMatch &&
        topicsMatch &&
        conferenceMatch &&
        notesMatch &&
        formatMatch
      );
    });
  }

  static fromUrlParams(params: URLSearchParams | string | null | undefined): TalksFilter {
    if (params == null) params = '';
    const searchParams = typeof params === 'string' ? new URLSearchParams(params) : params;
    const yearType = (searchParams.get('yearType') as 'specific' | 'before' | 'after' | 'last2' | 'last5' | null) || null;
    const yearParam = searchParams.get('year');
    const conference = searchParams.get('conference');
    const hasNotesParam = searchParams.get('hasNotes');
    const ratingParam = searchParams.get('rating');
    const formatParam = searchParams.get('format');

    // Migrate legacy author/topics params to unified query
    const queryTerms: string[] = [];

    const query = searchParams.get('query');
    if (query) queryTerms.push(query);

    // Legacy: migrate author to query
    const author = searchParams.get('author');
    if (author) queryTerms.push(author);

    // Legacy: migrate topics to query
    const topicsParam = searchParams.get('topics');
    if (topicsParam) {
      queryTerms.push(...topicsParam.split(',').filter(Boolean));
    }

    const parseValidInt = (value: string | null): number | null => {
      if (!value || value.trim() === '') return null;
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? null : parsed;
    };

    return new TalksFilter({
      yearType,
      year: parseValidInt(yearParam),
      author: null,  // No longer used - migrated to query
      topics: [],    // No longer used - migrated to query
      conference: conference || null,
      hasNotes: hasNotesParam === 'true',
      rating: parseValidInt(ratingParam),
      query: queryTerms.length > 0 ? queryTerms.join(' ') : '',
      formats:
        formatParam && formatParam !== 'all'
          ? formatParam.split(',').filter(Boolean)
          : [],
    });
  }
}