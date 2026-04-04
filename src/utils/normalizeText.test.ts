import { describe, it, expect } from 'vitest';
import { normalizeText } from './normalizeText';

describe('normalizeText', () => {
  it('converts text to lowercase', () => {
    expect(normalizeText('Hello World')).toBe('hello world');
  });

  it('removes accents from characters', () => {
    expect(normalizeText('café')).toBe('cafe');
    expect(normalizeText('résumé')).toBe('resume');
    expect(normalizeText('naïve')).toBe('naive');
  });

  it('handles combined accents and uppercase', () => {
    expect(normalizeText('José García')).toBe('jose garcia');
    expect(normalizeText('André François')).toBe('andre francois');
  });

  it('preserves non-accented characters', () => {
    expect(normalizeText('hello world 123')).toBe('hello world 123');
  });

  it('handles empty string', () => {
    expect(normalizeText('')).toBe('');
  });

  it('handles special unicode characters like ñ and ü', () => {
    expect(normalizeText('España')).toBe('espana');
    expect(normalizeText('über')).toBe('uber');
  });
});
