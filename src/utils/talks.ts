/**
 * Check if a talk has meaningful notes (not just whitespace or newlines)
 * @param notes The notes string to check
 * @returns true if the notes contain meaningful content
 */
export function hasMeaningfulNotes(notes?: string): boolean {
  if (!notes) return false;
  // Remove all whitespace and newlines
  const trimmed = notes.replace(/[\s\n\r]/g, '');
  return trimmed.length > 0;
} 