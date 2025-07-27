export interface ParsedSearch {
  author: string | null;
  topics: string[];
  query: string;
}

export function parseSearch(input: string): ParsedSearch {
  const tokens = input.trim().split(/\s+/).filter(Boolean);
  let author: string | null = null;
  const topics: string[] = [];
  const queryParts: string[] = [];

  for (const token of tokens) {
    if (token.toLowerCase().startsWith('author:')) {
      const value = token.slice('author:'.length);
      if (value) author = value;
    } else if (token.toLowerCase().startsWith('topic:')) {
      const value = token.slice('topic:'.length);
      if (value) topics.push(value);
    } else {
      queryParts.push(token);
    }
  }

  return { author, topics, query: queryParts.join(' ') };
}
