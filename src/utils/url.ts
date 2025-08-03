export const TALKS_FILTER_KEYS = [
  'year',
  'author',
  'topics',
  'conference',
  'hasNotes',
  'rating',
  'query',
  'format'
] as const;

export function mergeParams(
  current: URLSearchParams,
  next: URLSearchParams
): URLSearchParams {
  const merged = new URLSearchParams(next);
  for (const [key, value] of current.entries()) {
    if (
      !merged.has(key) &&
      !TALKS_FILTER_KEYS.includes(key as (typeof TALKS_FILTER_KEYS)[number])
    ) {
      merged.set(key, value);
    }
  }
  return merged;
}
