import { describe, it, expect } from 'vitest';
import { classNames } from './classNames';

describe('classNames', () => {
  it('joins class names with spaces and ignores falsy values', () => {
    expect(classNames('foo', undefined, '', 'bar', false, 'baz')).toBe('foo bar baz');
  });
});
