/**
 * Normalizes text for accent-insensitive, case-insensitive comparison.
 * Uses NFD normalization to decompose accented characters,
 * then removes combining diacritical marks.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
