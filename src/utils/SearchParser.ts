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
    // Skip whitespace
    while (i < text.length && /\s/.test(text[i])) {
      i++;
    }
    
    if (i >= text.length) break;
    
    // Check for author: or topic: prefix
    if (text.slice(i).toLowerCase().startsWith('author:')) {
      i += 'author:'.length;
      const value = extractValue(text, i);
      if (value.text) author = value.text;
      i = value.nextIndex;
    } else if (text.slice(i).toLowerCase().startsWith('topic:')) {
      i += 'topic:'.length;
      const value = extractValue(text, i);
      if (value.text) topics.push(value.text);
      i = value.nextIndex;
    } else {
      // Regular query text - collect until next keyword
      const word = extractQueryWord(text, i);
      if (word.text) queryParts.push(word.text);
      i = word.nextIndex;
    }
  }

  return { author, topics, query: queryParts.join(' ') };
}

function extractValue(text: string, startIndex: number): { text: string; nextIndex: number } {
  let i = startIndex;
  
  // Skip whitespace
  while (i < text.length && /\s/.test(text[i])) {
    i++;
  }
  
  if (i >= text.length) {
    return { text: '', nextIndex: i };
  }
  
  // Handle quoted strings
  if (text[i] === '"') {
    i++; // Skip opening quote
    let value = '';
    while (i < text.length && text[i] !== '"') {
      value += text[i];
      i++;
    }
    if (i < text.length) i++; // Skip closing quote
    return { text: value, nextIndex: i };
  }
  
  // Handle unquoted values - collect first word
  let value = '';
  while (i < text.length && !/\s/.test(text[i])) {
    value += text[i];
    i++;
  }
  
  // For unquoted values, check if next words might be part of the same name
  // Only continue if we have a common name pattern (no keywords in between)
  let potentialMultiWord = value;
  let tempIndex = i;
  
  while (tempIndex < text.length) {
    // Skip whitespace
    while (tempIndex < text.length && /\s/.test(text[tempIndex])) {
      tempIndex++;
    }
    
    if (tempIndex >= text.length || isAtKeyword(text, tempIndex)) {
      break;
    }
    
    // Collect next word
    let nextWord = '';
    while (tempIndex < text.length && !/\s/.test(text[tempIndex]) && !isAtKeyword(text, tempIndex)) {
      nextWord += text[tempIndex];
      tempIndex++;
    }
    
    // Only add if this looks like a continuation of a name (capitalized or common patterns)
    if (nextWord && (isCapitalized(nextWord) || isCommonNameWord(nextWord))) {
      potentialMultiWord += ' ' + nextWord;
      i = tempIndex;
    } else {
      // This word doesn't seem to be part of the name, stop here
      break;
    }
  }
  
  return { text: potentialMultiWord, nextIndex: i };
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
