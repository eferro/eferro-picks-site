
export class TalksFilter {
  public year: number | null = null;
  public query: string = '';

  constructor(search: string | null | undefined) {
    if (search) {
      const params = new URLSearchParams(search);
      const year = params.get('year');
      if (year) {
        this.year = parseInt(year, 10);
      }
      const query = params.get('query');
      if (query) {
        this.query = query;
      }
    }
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
}
