import { Talk } from "../types/talks";

export class TalksFilter {
  readonly year: number | null;
  readonly author: string | null;
  readonly topics: string[];
  readonly conference: string | null;
  readonly hasNotes: boolean;
  readonly rating: number | null;
  readonly query: string;

  constructor({
    year = null,
    author = null,
    topics = [],
    conference = null,
    hasNotes = false,
    rating = null,
    query = '',
  }: {
    year?: number | null;
    author?: string | null;
    topics?: string[];
    conference?: string | null;
    hasNotes?: boolean;
    rating?: number | null;
    query?: string;
  }) {
    this.year = year;
    this.author = author;
    this.topics = topics;
    this.conference = conference;
    this.hasNotes = hasNotes;
    this.rating = rating;
    this.query = query || '';
  }

  toParams(): string {
    const params = new URLSearchParams();
    if (this.year) {
      params.set('year', this.year.toString());
    }
    if (this.query) {
      params.set('query', this.query);
    }
    return params.toString();
  }

  filter(talks: Talk[]): Talk[] {
    return talks.filter(talk => {
      const yearMatch = !this.year || talk.year === this.year;
      const queryMatch = !this.query || talk.title.toLowerCase().includes(this.query.toLowerCase());
      return yearMatch && queryMatch;
    });
  }

  static fromUrlParams(params: URLSearchParams | string | null | undefined): TalksFilter {
    if (params == null) params = '';
    const searchParams = typeof params === 'string' ? new URLSearchParams(params) : params;
    const yearParam = searchParams.get('year');
    const author = searchParams.get('author');
    const topicsParam = searchParams.get('topics');
    const conference = searchParams.get('conference');
    const hasNotesParam = searchParams.get('hasNotes');
    const ratingParam = searchParams.get('rating');
    const query = searchParams.get('query') || '';
    return new TalksFilter({
      year: yearParam ? parseInt(yearParam, 10) : null,
      author: author || null,
      topics: topicsParam ? topicsParam.split(',').filter(Boolean) : [],
      conference: conference || null,
      hasNotes: hasNotesParam === 'true',
      rating: ratingParam ? parseInt(ratingParam, 10) : null,
      query,
    });
  }
}