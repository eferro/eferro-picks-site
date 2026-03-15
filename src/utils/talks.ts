// No imports needed - only utility functions remain

/**
 * Check if a talk has meaningful notes (not just whitespace or newlines)
 * @param notes The notes string to check
 * @returns true if the notes contain meaningful content
 */
export function hasMeaningfulNotes(notes: string | undefined | null): boolean {
  if (!notes) return false;
  return notes.trim().length > 0;
}

// Transformation function removed - data is now stored in normalized structure

// Filtering functions removed - filtering now happens during data transformation 