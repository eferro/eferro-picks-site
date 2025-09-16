export interface ParsedSearch {
  author: string | null;
  topics: string[];
  query: string;
}

export function parseSearch(input: string): ParsedSearch {
  let author: string | null = null;
  const topics: string[] = [];
  const queryParts: string[] = [];

  // Process the input character by character to handle quoted strings
  let i = 0;
  const text = input.trim();

  while (i < text.length) {
    i = skipWhitespace(text, i);
    if (i >= text.length) break;

    const prefix = matchPrefix(text, i);
    if (prefix) {
      const prefixLength = prefix.length + 1; // account for colon
      const value = extractValue(text, i + prefixLength);
      if (value.text) {
        if (prefix === 'author') {
          author = value.text;
        } else {
          topics.push(value.text);
        }
      }
      i = value.nextIndex;
      continue;
    }

    const word = extractQueryWord(text, i);
    if (word.text) {
      queryParts.push(word.text);
    }
    i = word.nextIndex;
  }

  return { author, topics, query: queryParts.join(' ') };
}

function extractValue(text: string, startIndex: number): { text: string; nextIndex: number } {
  const firstIndex = skipWhitespace(text, startIndex);
  if (firstIndex >= text.length) {
    return { text: '', nextIndex: firstIndex };
  }

  if (text[firstIndex] === '"') {
    return consumeQuotedValue(text, firstIndex + 1);
  }

  return consumeUnquotedValue(text, firstIndex);
}

function isCapitalized(word: string): boolean {
  return word.length > 0 && word[0] >= 'A' && word[0] <= 'Z';
}

function isCommonNameWord(word: string): boolean {
  // Common name suffixes/words that are likely part of names
  const commonNameWords = ['jr', 'sr', 'van', 'von', 'de', 'la', 'mc', 'mac', 'o'];
  return commonNameWords.includes(word.toLowerCase());
}

function extractQueryWord(text: string, startIndex: number): { text: string; nextIndex: number } {
  let i = startIndex;
  let word = '';

  while (i < text.length && !isAtKeyword(text, i) && !/\s/.test(text[i])) {
    word += text[i];
    i++;
  }

  return { text: word, nextIndex: i };
}

function isAtKeyword(text: string, index: number): boolean {
  const remaining = text.slice(index).toLowerCase();
  return remaining.startsWith('author:') || remaining.startsWith('topic:');
}

function skipWhitespace(text: string, index: number): number {
  while (index < text.length && /\s/.test(text[index])) {
    index++;
  }
  return index;
}

function matchPrefix(text: string, index: number): 'author' | 'topic' | null {
  const lower = text.slice(index).toLowerCase();
  if (lower.startsWith('author:')) {
    return 'author';
  }
  if (lower.startsWith('topic:')) {
    return 'topic';
  }
  return null;
}

function consumeQuotedValue(text: string, index: number): { text: string; nextIndex: number } {
  let i = index;
  let value = '';
  while (i < text.length && text[i] !== '"') {
    value += text[i];
    i++;
  }
  if (i < text.length) {
    i++; // Skip closing quote
  }
  return { text: value, nextIndex: i };
}

function consumeUnquotedValue(text: string, startIndex: number): { text: string; nextIndex: number } {
  const firstWord = readSimpleWord(text, startIndex);
  if (!firstWord.text) {
    return { text: '', nextIndex: firstWord.nextIndex };
  }

  const continuation = collectContinuationWords(text, firstWord.nextIndex, firstWord.text);
  return continuation;
}

function readSimpleWord(text: string, startIndex: number): { text: string; nextIndex: number } {
  let i = startIndex;
  let word = '';
  while (i < text.length && !/\s/.test(text[i])) {
    if (isAtKeyword(text, i)) {
      break;
    }
    word += text[i];
    i++;
  }
  return { text: word, nextIndex: i };
}

function collectContinuationWords(text: string, index: number, currentValue: string): { text: string; nextIndex: number } {
  let nextIndex = index;
  let value = currentValue;

  let candidateStart = skipWhitespace(text, nextIndex);
  while (candidateStart < text.length && !isAtKeyword(text, candidateStart)) {
    const candidate = readSimpleWord(text, candidateStart);
    if (!candidate.text || !shouldContinueName(candidate.text)) {
      return { text: value, nextIndex: candidateStart };
    }

    value += ` ${candidate.text}`;
    nextIndex = candidate.nextIndex;
    candidateStart = skipWhitespace(text, nextIndex);
  }

  return { text: value, nextIndex: candidateStart };
}

function shouldContinueName(word: string): boolean {
  if (isCommonNameWord(word)) {
    return true;
  }

  if (/^[A-Z]\.$/.test(word)) {
    return true;
  }

  if (!isCapitalized(word)) {
    return false;
  }

  return /[a-z]/.test(word.slice(1));
}
