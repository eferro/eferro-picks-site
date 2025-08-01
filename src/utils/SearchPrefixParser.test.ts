import { describe, it, expect } from 'vitest';
import { SearchPrefixParser } from './SearchPrefixParser';

describe('SearchPrefixParser', () => {
  describe('parsePrefix', () => {
    it('identifies author prefix in single word', () => {
      const result = SearchPrefixParser.parsePrefix('author:john');
      
      expect(result).toEqual({
        type: 'author',
        value: 'john',
        hasPrefix: true
      });
    });

    it('identifies topic prefix in single word', () => {
      const result = SearchPrefixParser.parsePrefix('topic:react');
      
      expect(result).toEqual({
        type: 'topic',
        value: 'react',
        hasPrefix: true
      });
    });

    it('identifies author prefix in last word of sentence', () => {
      const result = SearchPrefixParser.parseLastPrefix('hello world author:jane');
      
      expect(result).toEqual({
        type: 'author',
        value: 'jane',
        hasPrefix: true
      });
    });

    it('identifies topic prefix in last word of sentence', () => {
      const result = SearchPrefixParser.parseLastPrefix('search for topic:javascript');
      
      expect(result).toEqual({
        type: 'topic',
        value: 'javascript',
        hasPrefix: true
      });
    });

    it('handles partial prefix values', () => {
      const result = SearchPrefixParser.parseLastPrefix('author:');
      
      expect(result).toEqual({
        type: 'author',
        value: '',
        hasPrefix: true
      });
    });

    it('handles case insensitive prefixes', () => {
      const result = SearchPrefixParser.parseLastPrefix('AUTHOR:Smith');
      
      expect(result).toEqual({
        type: 'author',
        value: 'Smith',
        hasPrefix: true
      });
    });

    it('returns no prefix for regular text', () => {
      const result = SearchPrefixParser.parseLastPrefix('regular search text');
      
      expect(result).toEqual({
        type: null,
        value: 'text',
        hasPrefix: false
      });
    });

    it('returns no prefix for empty text', () => {
      const result = SearchPrefixParser.parseLastPrefix('');
      
      expect(result).toEqual({
        type: null,
        value: '',
        hasPrefix: false
      });
    });

    it('handles text with only spaces', () => {
      const result = SearchPrefixParser.parseLastPrefix('   ');
      
      expect(result).toEqual({
        type: null,
        value: '',
        hasPrefix: false
      });
    });
  });

  describe('replaceSuggestionInText', () => {
    it('replaces author prefix value with suggestion', () => {
      const result = SearchPrefixParser.replaceSuggestionInText(
        'search for author:john',
        'John Doe'
      );
      
      expect(result).toBe('search for author:John Doe');
    });

    it('replaces topic prefix value with suggestion', () => {
      const result = SearchPrefixParser.replaceSuggestionInText(
        'find topic:react',
        'React Hooks'
      );
      
      expect(result).toBe('find topic:React Hooks');
    });

    it('replaces partial prefix with suggestion', () => {
      const result = SearchPrefixParser.replaceSuggestionInText(
        'author:',
        'Jane Smith'
      );
      
      expect(result).toBe('author:Jane Smith');
    });

    it('handles single word with prefix', () => {
      const result = SearchPrefixParser.replaceSuggestionInText(
        'topic:js',
        'JavaScript'
      );
      
      expect(result).toBe('topic:JavaScript');
    });

    it('returns original text when no prefix in last word', () => {
      const result = SearchPrefixParser.replaceSuggestionInText(
        'regular search',
        'suggestion'
      );
      
      expect(result).toBe('regular search');
    });
  });

  describe('getSupportedPrefixes', () => {
    it('returns list of supported prefix types', () => {
      const prefixes = SearchPrefixParser.getSupportedPrefixes();
      
      expect(prefixes).toEqual(['author', 'topic']);
    });
  });
});