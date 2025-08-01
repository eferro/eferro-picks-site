export interface PrefixParseResult {
  type: 'author' | 'topic' | null;
  value: string;
  hasPrefix: boolean;
}

export class SearchPrefixParser {
  private static readonly SUPPORTED_PREFIXES = ['author', 'topic'] as const;
  
  /**
   * Parse prefix from a single word or text
   */
  static parsePrefix(text: string): PrefixParseResult {
    const trimmed = text.trim();
    
    for (const prefix of this.SUPPORTED_PREFIXES) {
      const prefixWithColon = `${prefix}:`;
      if (trimmed.toLowerCase().startsWith(prefixWithColon)) {
        return {
          type: prefix,
          value: trimmed.slice(prefixWithColon.length),
          hasPrefix: true
        };
      }
    }
    
    return {
      type: null,
      value: trimmed,
      hasPrefix: false
    };
  }

  /**
   * Parse prefix from the last word in a text string
   */
  static parseLastPrefix(text: string): PrefixParseResult {
    const trimmed = text.trim();
    
    if (!trimmed) {
      return {
        type: null,
        value: '',
        hasPrefix: false
      };
    }
    
    const parts = trimmed.split(/\s+/);
    const lastPart = parts[parts.length - 1];
    
    return this.parsePrefix(lastPart);
  }

  /**
   * Replace the value after a prefix with a suggestion
   */
  static replaceSuggestionInText(text: string, suggestion: string): string {
    const trimmed = text.trim();
    const prefixResult = this.parseLastPrefix(trimmed);
    
    if (!prefixResult.hasPrefix || !prefixResult.type) {
      return text;
    }
    
    const parts = trimmed.split(/\s+/);
    const prefixWithColon = `${prefixResult.type}:`;
    parts[parts.length - 1] = prefixWithColon + suggestion;
    
    return parts.join(' ');
  }

  /**
   * Get list of supported prefix types
   */
  static getSupportedPrefixes(): string[] {
    return [...this.SUPPORTED_PREFIXES];
  }
}