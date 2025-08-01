export const TALKS_FILTER_KEYS = [
  'year',
  'author',
  'topics',
  'conference',
  'hasNotes',
  'rating',
  'query',
  'format'
];

export function mergeParams(
  current: URLSearchParams,
  next: URLSearchParams
): URLSearchParams {
  for (const [key, value] of current.entries()) {
    if (!next.has(key) && !TALKS_FILTER_KEYS.includes(key)) {
      next.set(key, value);
    }
  }
  return next;
}
