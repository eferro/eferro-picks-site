import { Talk } from "../types/talks";
import { hasMeaningfulNotes } from "./talks";

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
    if (this.author) {
      params.set('author', this.author);
    }
    if (this.topics && this.topics.length > 0) {
      params.set('topics', this.topics.join(','));
    }
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
      let yearMatch = true;
      const currentYear = new Date().getFullYear();
      const effectiveYearType = this.yearType || (this.year != null ? 'specific' : null);
      if (effectiveYearType) {
        switch (effectiveYearType) {
          case 'last2':
            yearMatch = talk.year != null && talk.year >= currentYear - 2;
            break;
          case 'last5':
            yearMatch = talk.year != null && talk.year >= currentYear - 5;
            break;
          case 'before':
            yearMatch = this.year != null ? (talk.year != null && talk.year < this.year) : true;
            break;
          case 'after':
            yearMatch = this.year != null ? (talk.year != null && talk.year > this.year) : true;
            break;
          case 'specific':
            yearMatch = this.year != null ? (talk.year != null && talk.year === this.year) : true;
            break;
          default:
            yearMatch = true;
        }
      }
      const queryMatch = !this.query || talk.title.toLowerCase().includes(this.query.toLowerCase());
      const authorMatch = !this.author || talk.speakers.includes(this.author);
      const topicsMatch = this.topics.length === 0 || this.topics.every(t => talk.topics.includes(t));
      const conferenceMatch = !this.conference || talk.conference_name === this.conference;
      const notesMatch = !this.hasNotes || hasMeaningfulNotes(talk.notes);
      const formatMatch = this.formats.length === 0 || this.formats.includes((talk.format ?? 'talk'));
      return yearMatch && queryMatch && authorMatch && topicsMatch && conferenceMatch && notesMatch && formatMatch;
    });
  }

  static fromUrlParams(params: URLSearchParams | string | null | undefined): TalksFilter {
    if (params == null) params = '';
    const searchParams = typeof params === 'string' ? new URLSearchParams(params) : params;
    const yearType = (searchParams.get('yearType') as 'specific' | 'before' | 'after' | 'last2' | 'last5' | null) || null;
    const yearParam = searchParams.get('year');
    const author = searchParams.get('author');
    const topicsParam = searchParams.get('topics');
    const conference = searchParams.get('conference');
    const hasNotesParam = searchParams.get('hasNotes');
    const ratingParam = searchParams.get('rating');
    const formatParam = searchParams.get('format');
    const query = searchParams.get('query') || '';
    return new TalksFilter({
      yearType,
      year: yearParam ? parseInt(yearParam, 10) : null,
      author: author || null,
      topics: topicsParam ? topicsParam.split(',').filter(Boolean) : [],
      conference: conference || null,
      hasNotes: hasNotesParam === 'true',
      rating: ratingParam ? parseInt(ratingParam, 10) : null,
      query,
      formats:
        formatParam && formatParam !== 'all'
          ? formatParam.split(',').filter(Boolean)
          : [],
    });
  }
}